from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder

app = Flask(__name__)
CORS(app)  # Izinkan akses dari React

# === Load dan Latih Model ===
df = pd.read_csv("financial_transaction_dataset-tanpa_judul.csv")

fitur_input = ["Usia", "Jenis_Kelamin", "Pendapatan_Bulanan", "Saldo_Rekening",
               "Riwayat_Pinjaman", "Jenis_Transaksi_Favorit", "Frekuensi_Transaksi"]
target = "Produk_Direkomendasikan"

le_gender = LabelEncoder()
le_target = LabelEncoder()
le_transaksi = LabelEncoder()

df["Jenis_Kelamin"] = le_gender.fit_transform(df["Jenis_Kelamin"])
df["Jenis_Transaksi_Favorit"] = le_transaksi.fit_transform(df["Jenis_Transaksi_Favorit"])
df[target] = le_target.fit_transform(df[target])

X = df[fitur_input]
y = df[target]

model = DecisionTreeClassifier()
model.fit(X, y)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    print("Data diterima dari frontend:", data)

    try:
        usia = int(data["usia"])
        jenis_kelamin = le_gender.transform([data["jenisKelamin"]])[0]
        pendapatan = int(data["pendapatan"])
        saldo = int(data["saldo"])
        riwayat = 1 if data["riwayatPinjaman"].lower() == "pernah" else 0
        jenis_transaksi = le_transaksi.transform([data["jenisTransaksiFavorit"]])[0]
        frekuensi = int(data["frekuensiTransaksi"])

        input_data = [[usia, jenis_kelamin, pendapatan, saldo, riwayat, jenis_transaksi, frekuensi]]
        prediksi = model.predict(input_data)[0]
        hasil = le_target.inverse_transform([prediksi])[0]

        return jsonify({"rekomendasi": hasil})

    except Exception as e:
        print("Error:", str(e))  # 👈 ini penting
        return jsonify({'error': 'Invalid input', 'detail': str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)

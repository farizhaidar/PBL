"use client";

import Navbar from "./component/navbar";
import { useRouter } from "next/navigation";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Navbar />

      <div className="container-fluid bg-dark text-light vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h1 className="text-primary mb-5 fs-1 ">Chatbot</h1>
          <p className="mt-3 mx-5 px-5">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer eget lorem ut odio convallis posuere. Suspendisse potenti. Curabitur feugiat dui id sapien interdum, sed bibendum nunc pellentesque. Integer congue purus id orci aliquet, ac tincidunt lorem fermentum. Donec pharetra, lectus non pharetra efficitur, felis felis luctus velit, at fermentum magna justo non velit. Fusce tincidunt interdum sapien, nec varius lorem tincidunt ut.
          </p>
          <button className="btn btn-primary mt-3" onClick={() => router.push("/chat")}>
            Getting Start
          </button>
        </div>
      </div>
    </>
  );
}

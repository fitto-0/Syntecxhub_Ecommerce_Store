import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./styles/NotFoundPage.css";

const NotFoundPage = () => {
  const mainRef = useRef(null);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const shapes = main.querySelectorAll(".geo");
    const num = main.querySelector(".num-404");

    const handleMouseMove = (e) => {
      const r = main.getBoundingClientRect();
      const cx = r.width / 2;
      const cy = r.height / 2;
      const dx = (e.clientX - r.left - cx) / cx;
      const dy = (e.clientY - r.top - cy) / cy;

      shapes.forEach((s, i) => {
        const d = ((i % 3) + 1) * 6;
        s.style.transform = `translate(${dx * d}px, ${dy * d}px)`;
      });

      if (num) {
        num.style.transform = `perspective(400px) rotateY(${dx * 5}deg) rotateX(${-dy * 3}deg)`;
        num.style.transition = "transform 0.1s ease-out";
      }
    };

    const handleMouseLeave = () => {
      shapes.forEach((s) => (s.style.transform = ""));
      if (num) num.style.transform = "";
    };

    main.addEventListener("mousemove", handleMouseMove);
    main.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      main.removeEventListener("mousemove", handleMouseMove);
      main.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="nova-root">
      {/* MAIN */}
      <main className="nova-main" ref={mainRef}>
        <div className="dot-grid" />

        {/* 3D Cube */}
        <div className="scene-3d">
          <div className="cube-wrap">
            <div className="cube">
              <div className="cube-face f-front" />
              <div className="cube-face f-back" />
              <div className="cube-face f-left" />
              <div className="cube-face f-right" />
              <div className="cube-face f-top" />
              <div className="cube-face f-bottom" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="content-404">
          <div className="num-404">404</div>
          <div className="label-strip">
            <div className="strip-line" />
            <span className="label-text">Error</span>
            <div className="strip-line" />
          </div>
          <div className="title-404">Page Not Found</div>
          <p className="desc-404">
            The page you're looking for has wandered off.
            <br />
            Let's get you back on track.
          </p>
          <Link to="/" className="btn-home">
            <span>Return Home</span>
            <span className="btn-arrow">→</span>
          </Link>
        </div>
      </main>

    </div>
  );
};

export default NotFoundPage;

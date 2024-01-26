import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import ThreeGlobe from "three-globe";
import countries from "./files/globe-data-min.json";
import travelHistory from "./files/my-flights.json";

const Globe = React.memo(() => {
  const globeRef = useRef(null);
  const animationRef = useRef(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const windowHalfX = useRef(window.innerWidth / 2);
  const windowHalfY = useRef(window.innerHeight / 2);
  const renderer = useRef(new THREE.WebGLRenderer({ antialias: true }));
  const camera = useRef(new THREE.PerspectiveCamera());
  const scene = useRef(new THREE.Scene());
  const controls = useRef(
    new OrbitControls(camera.current, renderer.current.domElement)
  );

  useEffect(() => {
    const onWindowResize = () => {
      camera.current.aspect = window.innerWidth / window.innerHeight;
      camera.current.updateProjectionMatrix();
      renderer.current.setSize(window.innerWidth, window.innerHeight);
      windowHalfX.current = window.innerWidth / 2;
      windowHalfY.current = window.innerHeight / 2;
    };

    const onMouseMove = (event) => {
      mouseX.current = event.clientX - windowHalfX.current;
      mouseY.current = event.clientY - windowHalfY.current;
    };

    const animate = () => {
      // Rotate the globe continuously from left to right
      scene.current.rotation.y -= 0.0005;

      camera.current.position.x +=
        Math.abs(mouseX.current) <= windowHalfX.current / 2
          ? (mouseX.current / 2 - camera.current.position.x) * 0.005
          : 0;
      camera.current.position.y +=
        (-mouseY.current / 2 - camera.current.position.y) * 0.005;
      camera.current.lookAt(scene.current.position);
      controls.current.update();
      renderer.current.render(scene.current, camera.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    const init = () => {
      renderer.current.setPixelRatio(window.devicePixelRatio);
      renderer.current.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.current.domElement);
      document.body.style.overflow = "hidden";

      scene.current.add(new THREE.AmbientLight(0xffffff, 0.5)); // Ambient light
      const dirLight = new THREE.DirectionalLight(0xffffff, 1); // Directional light
      dirLight.position.set(5, 3, 4); // Adjust light position
      scene.current.add(dirLight);
      scene.current.background = new THREE.Color(0x000000); // Set background color

      camera.current.aspect = window.innerWidth / window.innerHeight;
      camera.current.position.z = 400;
      camera.current.position.x = 0;
      camera.current.position.y = 0;
      camera.current.updateProjectionMatrix();

      controls.current.enableDamping = true;
      controls.current.dynamicDampingFactor = 0.01;
      controls.current.enablePan = false;
      controls.current.minDistance = 200;
      controls.current.maxDistance = 500;
      controls.current.rotateSpeed = 0.8;
      controls.current.zoomSpeed = 1;
      controls.current.autoRotate = false;
      controls.current.minPolarAngle = Math.PI / 3.5;
      controls.current.maxPolarAngle = Math.PI - Math.PI / 3;

      window.addEventListener("resize", onWindowResize);
      document.addEventListener("mousemove", onMouseMove);
    };

    const initGlobe = () => {
      const Globe = new ThreeGlobe({
        waitForGlobeReady: true,
        animateIn: true,
      })
        .hexPolygonsData(countries.features)
        .hexPolygonResolution(3)
        .hexPolygonMargin(0.7)
        .showAtmosphere(true)
        .atmosphereColor("#3a228a")
        .atmosphereAltitude(0.25)
        .hexPolygonColor((e) =>
          ["KGZ", "KOR", "THA", "RUS", "UZB", "IDN", "KAZ", "MYS"].includes(
            e.properties.ISO_A3
          )
            ? "rgba(255,255,255, 1)"
            : "rgba(255,255,255, 0.7)"
        );

      setTimeout(() => {
        Globe.arcsData(travelHistory.flights)
          .arcColor((e) => (e.status ? "#00ff00" : "#ff0000"))
          .arcAltitude((e) => e.arcAlt)
          .arcStroke((e) => (e.status ? 0.5 : 0.3))
          .arcDashLength(0.9)
          .arcDashGap(4)
          .arcDashAnimateTime(1000)
          .arcsTransitionDuration(1000)
          .arcDashInitialGap((e) => e.order * 1)
      }, 1000);

      Globe.rotateY(-Math.PI * (5 / 9));
      Globe.rotateZ(-Math.PI / 6);
      const globeMaterial = Globe.globeMaterial();
      globeMaterial.color = new THREE.Color(0x3a228a);
      globeMaterial.emissive = new THREE.Color(0x220038);
      globeMaterial.emissiveIntensity = 0.1;
      globeMaterial.shininess = 0.7;
      globeMaterial.opacity = 0.2; // adjust this to change the transparency, 0 is fully transparent, 1 is fully opaque
      globeMaterial.transparent = true; // this needs to be set to true for the opacity to take effect

      scene.current.add(Globe);
    };

    init();
    initGlobe();
    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", onWindowResize);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return <div ref={globeRef} />;
});

export default Globe;

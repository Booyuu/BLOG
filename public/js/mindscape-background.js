window.mountMindscapeBackdrop = function (container, variant = 'home') {
    const THREE = window.THREE;
    if (!container || !THREE) return () => {};

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
        return () => {};
    }

    const article = variant === 'article';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();
    if (!article) scene.fog = new THREE.FogExp2(0x000000, 0.001);
    const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 2000);
    camera.position.z = 100;
    container.appendChild(renderer.domElement);
    const geometry = new THREE.BufferGeometry();
    const count = article ? 2000 : 6000;
    const positions = new Float32Array(count * 3);
    const spread = article ? 1200 : 1500;
    for (let i = 0; i < positions.length; i += 3) {
        positions[i] = (Math.random() - 0.5) * spread;
        positions[i + 1] = (Math.random() - 0.5) * spread;
        positions[i + 2] = (Math.random() - 0.5) * (article ? 1200 : 2000);
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
        size: article ? 1 : 1.2,
        color: article ? 0x888888 : 0xffffff,
        transparent: !article,
        opacity: article ? 1 : 0.8,
        sizeAttenuation: true,
    });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);

    let mouseX = 0;
    let mouseY = 0;
    let frame;
    function move(event) {
        mouseX = (event.clientX - innerWidth / 2) * 0.05;
        mouseY = (event.clientY - innerHeight / 2) * 0.05;
    }
    function resize() {
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight);
        renderer.render(scene, camera);
    }
    function animate() {
        stars.rotation.y += article ? 0.0003 : 0.0002;
        if (!article) {
            stars.rotation.x += 0.0001;
            camera.position.x += (mouseX - camera.position.x) * 0.05;
            camera.position.y += (-mouseY - camera.position.y) * 0.05;
            camera.position.z = 100 - scrollY * 0.1;
            camera.lookAt(scene.position);
        }
        renderer.render(scene, camera);
        frame = requestAnimationFrame(animate);
    }
    resize();
    window.addEventListener('resize', resize);
    if (!reducedMotion) {
        if (!article) window.addEventListener('mousemove', move);
        animate();
    }

    return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener('mousemove', move);
        window.removeEventListener('resize', resize);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
    };
};

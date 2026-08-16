import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import './KPICard.css';

function AnimatedNumber({ value, duration = 1000 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = value;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.floor(start + (end - start) * eased);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [value, duration, prefersReducedMotion]);

  return displayValue;
}

function KPICard({ icon, label, value, delay = 0, accentColor = 'primary' }) {
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 15 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleMouseMove = (e) => {
    if (prefersReducedMotion || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    mouseX.set((e.clientX - centerX) / 5);
    mouseY.set((e.clientY - centerY) / 5);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!prefersReducedMotion) {
      mouseX.set(0);
      mouseY.set(0);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={`kpi-card accent-${accentColor}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      style={prefersReducedMotion ? {} : { rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
    >
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-content">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">
          <AnimatedNumber value={value} />
        </div>
      </div>
      {isHovered && !prefersReducedMotion && (
        <motion.div
          className="kpi-glow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
}

export default KPICard;

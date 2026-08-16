import { useState, useEffect } from 'react';
import './MouseFollowingWorker.css';

function MouseFollowingWorker() {
  const [eyePosition, setEyePosition] = useState({ leftX: 0, leftY: 0, rightX: 0, rightY: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [headTilt, setHeadTilt] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) return;

    let animationFrameId = null;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e) => {
      currentMouseX = e.clientX;
      currentMouseY = e.clientY;

      // Cancel previous animation frame if it exists
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      // Use requestAnimationFrame for smooth, real-time updates
      animationFrameId = requestAnimationFrame(() => {
        const worker = document.querySelector('.sleeping-worker-container');
        if (!worker) return;

        const workerRect = worker.getBoundingClientRect();

        // Calculate exact eye center positions
        const workerCenterX = workerRect.left + (workerRect.width / 2);
        const workerCenterY = workerRect.top + (workerRect.height / 2);

        // Eye positions relative to worker center
        const leftEyeX = workerCenterX - 8;
        const leftEyeY = workerRect.top + 23;
        const rightEyeX = workerCenterX + 8;
        const rightEyeY = workerRect.top + 23;

        // Calculate angle from eye to mouse for LEFT eye
        const deltaLeftX = currentMouseX - leftEyeX;
        const deltaLeftY = currentMouseY - leftEyeY;
        const angleLeft = Math.atan2(deltaLeftY, deltaLeftX);
        const distanceLeft = Math.sqrt(deltaLeftX * deltaLeftX + deltaLeftY * deltaLeftY);

        // Calculate angle from eye to mouse for RIGHT eye
        const deltaRightX = currentMouseX - rightEyeX;
        const deltaRightY = currentMouseY - rightEyeY;
        const angleRight = Math.atan2(deltaRightY, deltaRightX);
        const distanceRight = Math.sqrt(deltaRightX * deltaRightX + deltaRightY * deltaRightY);

        // Movement intensity based on distance (closer = more movement)
        const maxPupilMovement = 3;
        const movementIntensity = 0.05; // Sensitivity factor

        // Calculate pupil positions
        const leftX = Math.cos(angleLeft) * Math.min(maxPupilMovement, distanceLeft * movementIntensity);
        const leftY = Math.sin(angleLeft) * Math.min(maxPupilMovement, distanceLeft * movementIntensity);
        const rightX = Math.cos(angleRight) * Math.min(maxPupilMovement, distanceRight * movementIntensity);
        const rightY = Math.sin(angleRight) * Math.min(maxPupilMovement, distanceRight * movementIntensity);

        setEyePosition({
          leftX: Math.max(-maxPupilMovement, Math.min(maxPupilMovement, leftX)),
          leftY: Math.max(-maxPupilMovement, Math.min(maxPupilMovement, leftY)),
          rightX: Math.max(-maxPupilMovement, Math.min(maxPupilMovement, rightX)),
          rightY: Math.max(-maxPupilMovement, Math.min(maxPupilMovement, rightY)),
        });

        // Calculate head tilt based on mouse position
        const deltaX = currentMouseX - workerCenterX;
        const deltaY = currentMouseY - workerCenterY;

        // Subtle head tilt (max 3 degrees)
        const tiltX = Math.max(-3, Math.min(3, deltaY / 150));
        const tiltY = Math.max(-3, Math.min(3, deltaX / 150));

        setHeadTilt({ x: tiltX, y: tiltY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [prefersReducedMotion]);

  // Blinking animation
  useEffect(() => {
    if (prefersReducedMotion) return;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [prefersReducedMotion]);

  return (
    <div className="sleeping-worker-container">
      {/* Speech Bubble - appears on hover */}
      <div className="speech-bubble">
        <span className="speech-text">Hi!</span>
        <div className="speech-tail"></div>
      </div>

      <div className="sleeping-worker">
        {/* Hard Hat */}
        <div className="worker-hat">
          <div className="hat-shine"></div>
          <div className="hat-stripe"></div>
        </div>

        {/* Head */}
        <div
          className="worker-head"
          style={
            prefersReducedMotion
              ? {}
              : {
                  transform: `rotateX(${headTilt.x}deg) rotateY(${headTilt.y}deg)`
                }
          }
        >
          {/* Eyes */}
          <div className={`worker-eyes ${isBlinking ? 'blinking' : ''}`}>
            <div className="worker-eye left-worker-eye">
              <div className="eye-white">
                <div
                  className="worker-pupil"
                  style={
                    prefersReducedMotion || isBlinking
                      ? {}
                      : {
                          transform: `translate(${eyePosition.leftX}px, ${eyePosition.leftY}px)`
                        }
                  }
                >
                  <div className="pupil-shine"></div>
                </div>
              </div>
              <div className="eyelid"></div>
            </div>
            <div className="worker-eye right-worker-eye">
              <div className="eye-white">
                <div
                  className="worker-pupil"
                  style={
                    prefersReducedMotion || isBlinking
                      ? {}
                      : {
                          transform: `translate(${eyePosition.rightX}px, ${eyePosition.rightY}px)`
                        }
                  }
                >
                  <div className="pupil-shine"></div>
                </div>
              </div>
              <div className="eyelid"></div>
            </div>
          </div>

          {/* Eyebrows */}
          <div className="eyebrow left-eyebrow"></div>
          <div className="eyebrow right-eyebrow"></div>

          {/* Nose */}
          <div className="worker-nose"></div>

          {/* Cheeks */}
          <div className="cheek left-cheek"></div>
          <div className="cheek right-cheek"></div>

          {/* Smiling Mouth */}
          <div className="worker-mouth-smile">
            <div className="upper-lip"></div>
            <div className="lower-lip"></div>
            <div className="mouth-opening"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MouseFollowingWorker;

import React, { useEffect, useRef } from 'react';
import { WolfieEmotion, WolfieSize } from '../types';

interface WolfieCharacterProps {
  emotion?: WolfieEmotion;
  size?: WolfieSize;
  companionType?: string; // 'wolfie_guardian' | 'mochi_cat' | 'buddy_dog' | 'nova_fox' | 'zen_panda'
  equippedAccessories?: string[];
  onClick?: () => void;
  className?: string;
  isInteractive?: boolean;
}

export const WolfieCharacter: React.FC<WolfieCharacterProps> = ({
  emotion = 'HAPPY',
  size = 'MEDIUM',
  companionType = 'wolfie_guardian',
  equippedAccessories = [],
  onClick,
  className = '',
  isInteractive = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const [clickReaction, setClickReaction] = React.useState<string | null>(null);

  const dim = size === 'SMALL' ? 80 : size === 'LARGE' ? 180 : 120;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let start = performance.now();

    const render = (now: number) => {
      const dt = (now - start) / 1000;
      timeRef.current += dt;
      start = now;
      const t = timeRef.current;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.save();

      // Center reference
      const cx = w / 2;
      const cy = h / 2;

      // Base breathing / floating translation
      const isSleeping = emotion === 'SLEEPING';
      const isMeditating = emotion === 'MEDITATING';
      const isCelebrating = emotion === 'CELEBRATING' || clickReaction === 'jump';

      let bounceY = Math.sin(t * 3) * (isSleeping ? 1.5 : 3);
      if (isCelebrating) {
        bounceY = -Math.abs(Math.sin(t * 8)) * 14;
      }
      if (isHovered && !isCelebrating) {
        bounceY -= 4;
      }

      ctx.translate(cx, cy + bounceY);

      // Shadow on floor
      const shadowScale = 1 - bounceY / 30;
      ctx.save();
      ctx.translate(0, 48);
      ctx.beginPath();
      ctx.ellipse(0, 0, 36 * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(100, 116, 139, 0.16)';
      ctx.fill();
      ctx.restore();

      // Aura if celebrating / soul guardian
      if (isCelebrating || equippedAccessories.includes('item_crown')) {
        ctx.save();
        const auraAlpha = 0.25 + 0.15 * Math.sin(t * 5);
        const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 60);
        grad.addColorStop(0, `rgba(253, 224, 71, ${auraAlpha})`);
        grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Wings if equipped
      if (equippedAccessories.includes('item_wings')) {
        ctx.save();
        const wingFlap = Math.sin(t * 4) * 0.15;
        // Left wing
        ctx.save();
        ctx.translate(-24, -8);
        ctx.rotate(-0.3 + wingFlap);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(-18, -6, 20, 10, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Right wing
        ctx.save();
        ctx.translate(24, -8);
        ctx.rotate(0.3 - wingFlap);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(18, -6, 20, 10, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        ctx.restore();
      }

      // Palette selection by Companion Type
      let bodyColor = '#64748B'; // Wolfie Slate
      let underColor = '#F8FAFC';
      let innerEarColor = '#FDA4AF';
      let accentColor = '#818CF8';

      if (companionType === 'mochi_cat') {
        bodyColor = '#FDE68A'; // Warm Mochi cream
        underColor = '#FFFBEB';
        innerEarColor = '#F472B6';
        accentColor = '#10B981';
      } else if (companionType === 'buddy_dog') {
        bodyColor = '#D97706'; // Golden Buddy
        underColor = '#FEF3C7';
        innerEarColor = '#FCA5A5';
        accentColor = '#0284C7';
      } else if (companionType === 'nova_fox') {
        bodyColor = '#EA580C'; // Rust Fox
        underColor = '#FFF7ED';
        innerEarColor = '#FDA4AF';
        accentColor = '#8B5CF6';
      } else if (companionType === 'zen_panda') {
        bodyColor = '#1E293B'; // Panda dark
        underColor = '#FFFFFF';
        innerEarColor = '#94A3B8';
        accentColor = '#059669';
      }

      // Ears (with twitching animation)
      const earTwitch = Math.sin(t * 2) > 0.95 ? Math.sin(t * 30) * 0.1 : 0;

      // Left Ear
      ctx.save();
      ctx.translate(-24, -26);
      ctx.rotate(-0.15 + earTwitch);
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.moveTo(-10, 14);
      ctx.lineTo(0, -18);
      ctx.lineTo(12, 14);
      ctx.closePath();
      ctx.fill();
      // Inner ear
      ctx.fillStyle = innerEarColor;
      ctx.beginPath();
      ctx.moveTo(-6, 12);
      ctx.lineTo(0, -12);
      ctx.lineTo(8, 12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Right Ear
      ctx.save();
      ctx.translate(24, -26);
      ctx.rotate(0.15 - earTwitch);
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.moveTo(-12, 14);
      ctx.lineTo(0, -18);
      ctx.lineTo(10, 14);
      ctx.closePath();
      ctx.fill();
      // Inner ear
      ctx.fillStyle = innerEarColor;
      ctx.beginPath();
      ctx.moveTo(-8, 12);
      ctx.lineTo(0, -12);
      ctx.lineTo(6, 12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Head & Body Base Shape (Soft Organic Rounded)
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(0, 0, 36, 32, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fluffy Chest / Muzzle light patch
      ctx.fillStyle = underColor;
      ctx.beginPath();
      ctx.ellipse(0, 8, 22, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cheek fluff tufts (Wolfie / Fox signature)
      ctx.fillStyle = bodyColor;
      // Left cheek fluff
      ctx.beginPath();
      ctx.moveTo(-34, 0);
      ctx.lineTo(-44, 4);
      ctx.lineTo(-32, 10);
      ctx.closePath();
      ctx.fill();
      // Right cheek fluff
      ctx.beginPath();
      ctx.moveTo(34, 0);
      ctx.lineTo(44, 4);
      ctx.lineTo(32, 10);
      ctx.closePath();
      ctx.fill();

      // Blushing Cheeks
      const blushAlpha = (emotion === 'HAPPY' || emotion === 'CELEBRATING' || isHovered) ? 0.6 : 0.3;
      ctx.fillStyle = `rgba(244, 114, 182, ${blushAlpha})`;
      ctx.beginPath();
      ctx.ellipse(-20, 8, 6, 3.5, 0, 0, Math.PI * 2);
      ctx.ellipse(20, 8, 6, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Snout / Nose
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(0, 3, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes Drawing
      const blink = Math.sin(t * 0.7) > 0.98;

      if (blink || isSleeping || isMeditating) {
        // Sleepy / Serene curved eyes
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        // Left eye
        ctx.beginPath();
        ctx.arc(-14, -2, 6, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        // Right eye
        ctx.beginPath();
        ctx.arc(14, -2, 6, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      } else if (emotion === 'HAPPY' || emotion === 'CELEBRATING') {
        // Joyful ^ ^ happy eyes
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        // Left happy arc
        ctx.beginPath();
        ctx.arc(-14, 0, 6, 1.1 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();
        // Right happy arc
        ctx.beginPath();
        ctx.arc(14, 0, 6, 1.1 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();
      } else {
        // Alert open shiny eyes (Listening, Thinking, Supportive)
        // Left Eye
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.ellipse(-14, -2, 5.5, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Catchlights
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-12, -4, 2.2, 0, Math.PI * 2);
        ctx.arc(-15, 0, 1.1, 0, Math.PI * 2);
        ctx.fill();

        // Right Eye
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.ellipse(14, -2, 5.5, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Catchlights
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(16, -4, 2.2, 0, Math.PI * 2);
        ctx.arc(13, 0, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mouth Animation
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';

      if (emotion === 'TYPING') {
        // Talking mouth
        const talkMouth = Math.abs(Math.sin(t * 12)) * 3.5;
        ctx.fillStyle = '#FDA4AF';
        ctx.beginPath();
        ctx.ellipse(0, 10, 3.5, talkMouth + 1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (emotion === 'SLEEPING') {
        // Tiny cute 'o' mouth
        ctx.beginPath();
        ctx.arc(0, 9, 2.5, 0, Math.PI * 2);
        ctx.stroke();
      } else if (emotion === 'HAPPY' || emotion === 'CELEBRATING') {
        // Big open smiling mouth
        ctx.fillStyle = '#FDA4AF';
        ctx.beginPath();
        ctx.arc(0, 8, 6, 0.1 * Math.PI, 0.9 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        // Gentle friendly cat/wolf mouth curves
        ctx.beginPath();
        ctx.moveTo(-5, 8);
        ctx.quadraticCurveTo(-2, 11, 0, 7.5);
        ctx.quadraticCurveTo(2, 11, 5, 8);
        ctx.stroke();
      }

      // Paws / Gestures
      ctx.fillStyle = underColor;
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 1.5;

      if (emotion === 'CELEBRATING') {
        // Paws up in the air
        // Left paw up
        ctx.beginPath();
        ctx.ellipse(-26, -14 + Math.sin(t * 10) * 3, 6, 8, -0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Right paw up
        ctx.beginPath();
        ctx.ellipse(26, -14 + Math.cos(t * 10) * 3, 6, 8, 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (emotion === 'MEDITATING') {
        // Paws together resting
        ctx.beginPath();
        ctx.ellipse(-8, 24, 6, 5, 0.2, 0, Math.PI * 2);
        ctx.ellipse(8, 24, 6, 5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        // Gentle resting paws
        ctx.beginPath();
        ctx.ellipse(-16, 24, 7, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(16, 24, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // ACCESSORIES RENDERING
      // 1. Sprout Leaf Pin
      if (equippedAccessories.includes('item_leaf') || equippedAccessories.includes('Leaf Pin')) {
        ctx.save();
        ctx.translate(-14, -30);
        ctx.fillStyle = '#22C55E';
        ctx.beginPath();
        ctx.ellipse(0, -6, 4, 8, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#15803D';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -12);
        ctx.stroke();
        ctx.restore();
      }

      // 2. Red Cozy Scarf
      if (equippedAccessories.includes('item_scarf') || equippedAccessories.includes('Red Cozy Scarf')) {
        ctx.fillStyle = '#EF4444';
        ctx.strokeStyle = '#B91C1C';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-24, 16, 48, 10, 5);
        ctx.fill();
        ctx.stroke();
        // Scarf tail
        ctx.beginPath();
        ctx.roundRect(10, 22, 10, 16, 3);
        ctx.fill();
        ctx.stroke();
      }

      // 3. Scholar Glasses
      if (equippedAccessories.includes('item_glasses') || equippedAccessories.includes('Smart Glasses')) {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        // Left rim
        ctx.beginPath();
        ctx.arc(-14, -2, 9, 0, Math.PI * 2);
        ctx.stroke();
        // Right rim
        ctx.beginPath();
        ctx.arc(14, -2, 9, 0, Math.PI * 2);
        ctx.stroke();
        // Bridge
        ctx.beginPath();
        ctx.moveTo(-5, -2);
        ctx.lineTo(5, -2);
        ctx.stroke();
      }

      // 4. Explorer Straw Hat
      if (equippedAccessories.includes('item_hat') || equippedAccessories.includes('Explorer Hat')) {
        ctx.save();
        ctx.translate(0, -32);
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.ellipse(0, 4, 38, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(-16, -14, 32, 16, [10, 10, 0, 0]);
        ctx.fill();
        // Ribbon
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(-16, -1, 32, 4);
        ctx.restore();
      }

      // 5. Crown
      if (equippedAccessories.includes('item_crown') || equippedAccessories.includes('Starlight Crown')) {
        ctx.save();
        ctx.translate(0, -34);
        ctx.fillStyle = '#F59E0B';
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-16, 0);
        ctx.lineTo(-14, -14);
        ctx.lineTo(-7, -4);
        ctx.lineTo(0, -18);
        ctx.lineTo(7, -4);
        ctx.lineTo(14, -14);
        ctx.lineTo(16, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Gem
        ctx.fillStyle = '#EC4899';
        ctx.beginPath();
        ctx.arc(0, -6, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [emotion, size, companionType, equippedAccessories, isHovered, clickReaction]);

  const handleClick = () => {
    if (!isInteractive) return;
    setClickReaction('jump');
    setTimeout(() => setClickReaction(null), 900);
    if (onClick) onClick();
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center cursor-pointer select-none transition-transform ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      title="Tap to pet your companion!"
    >
      <canvas
        ref={canvasRef}
        width={dim * 2}
        height={dim * 2}
        style={{ width: `${dim}px`, height: `${dim}px` }}
        className="touch-none"
      />
    </div>
  );
};

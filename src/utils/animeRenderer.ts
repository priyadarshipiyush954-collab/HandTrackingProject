import { AnimeEffectInstance, Particle } from '../types/tracker';

export function createEffectParticles(name: 'BANKAI' | 'SHADOW CLONE', width: number, height: number): Particle[] {
  const particles: Particle[] = [];
  const cx = width / 2;
  const cy = height / 2;

  if (name === 'BANKAI') {
    // Crimson and black spiritual pressure embers & lightning slashes
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      particles.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: cy + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 3 + Math.random() * 6,
        color: Math.random() > 0.3 ? '#ef4444' : '#111827',
        alpha: 1,
        life: 0,
        maxLife: 40 + Math.random() * 50,
      });
    }
  } else if (name === 'SHADOW CLONE') {
    // Shinobi smoke puffs & white-blue chakra burst
    for (let i = 0; i < 110; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 7;
      particles.push({
        x: cx + (Math.random() - 0.5) * 450,
        y: cy + (Math.random() - 0.5) * 80,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
        size: 8 + Math.random() * 16,
        color: Math.random() > 0.5 ? '#f8fafc' : '#38bdf8',
        alpha: 0.85,
        life: 0,
        maxLife: 35 + Math.random() * 45,
      });
    }
  }

  return particles;
}

export function drawAnimeEffect(
  ctx: CanvasRenderingContext2D,
  effect: AnimeEffectInstance,
  width: number,
  height: number,
  now: number
) {
  const elapsed = (now - effect.startedAt) / 1000;
  const ratio = Math.min(1.0, elapsed / effect.duration);

  const cx = width / 2;
  const cy = height / 2;

  ctx.save();

  if (effect.name === 'BANKAI') {
    // Red / Crimson atmospheric flash
    const flashAlpha = Math.max(0, (1 - ratio * 1.5) * 0.35);
    if (flashAlpha > 0) {
      ctx.fillStyle = `rgba(220, 20, 20, ${flashAlpha})`;
      ctx.fillRect(0, 0, width, height);
    }

    // Mathematical formula from main.py:
    // pulse = 0.12 * np.sin(ratio * 18)
    // radius = int((95 + ratio * 320) * (1 + pulse))
    const pulse = 0.12 * Math.sin(ratio * 18);
    const radius = Math.max(10, (95 + ratio * 320) * (1 + pulse));

    // Outer crimson energy ring with glow
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 35;
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner dark blood-red ring (int(radius * 0.65), thickness 10)
    ctx.shadowColor = '#7f1d1d';
    ctx.shadowBlur = 20;
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#991b1b';
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(5, radius * 0.65), 0, Math.PI * 2);
    ctx.stroke();

    // Third central ring for depth
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(2, radius * 0.35), 0, Math.PI * 2);
    ctx.stroke();

    // Cross slashing blade rays
    const slashAngle = ratio * Math.PI * 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(slashAngle) * radius * 1.2, cy - Math.sin(slashAngle) * radius * 1.2);
    ctx.lineTo(cx + Math.cos(slashAngle) * radius * 1.2, cy + Math.sin(slashAngle) * radius * 1.2);
    ctx.moveTo(cx + Math.sin(slashAngle) * radius * 1.2, cy - Math.cos(slashAngle) * radius * 1.2);
    ctx.lineTo(cx - Math.sin(slashAngle) * radius * 1.2, cy + Math.cos(slashAngle) * radius * 1.2);
    ctx.stroke();

    // Draw typography: "BANKAI"
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 40;
    ctx.font = '900 64px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Black border/shadow
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.strokeText('卍解 BANKAI', cx, cy);

    // Glowing white fill
    ctx.fillStyle = '#ffffff';
    ctx.fillText('卍解 BANKAI', cx, cy);

    // Japanese subtitle subtext
    ctx.font = '700 20px -apple-system, sans-serif';
    ctx.fillStyle = '#fca5a5';
    ctx.fillText('TENSA ZANGETSU • SPIRITUAL PRESSURE', cx, cy + 50);

  } else if (effect.name === 'SHADOW CLONE') {
    // Formula from main.py:
    // wave = np.sin(ratio * 24)
    // for i in range(6):
    //     spread = int((i - 2.5) * 110 + wave * 25 * (i % 2 * 2 - 1))
    //     cx = w // 2 + spread
    //     cy = h // 2 + int(18 * np.cos(ratio * 20 + i))
    //     cv2.circle(overlay, (cx, cy), 52, (240, 240, 240), 3)
    const wave = Math.sin(ratio * 24);

    for (let i = 0; i < 6; i++) {
      const spread = (i - 2.5) * 110 + wave * 25 * (i % 2 * 2 - 1);
      const cloneX = cx + spread;
      const cloneY = cy + 18 * Math.cos(ratio * 20 + i);

      // Clone silhouette shadow
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 25;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.beginPath();
      ctx.arc(cloneX, cloneY, 52, 0, Math.PI * 2);
      ctx.fill();

      // Outer aura stroke
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#e2e8f0';
      ctx.stroke();

      // Inner chakra core
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.arc(cloneX, cloneY, 28, 0, Math.PI * 2);
      ctx.fill();

      // Clone number label
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`#${i + 1}`, cloneX, cloneY);
    }

    // Typography: "SHADOW CLONE"
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 30;
    ctx.font = '800 48px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.strokeText('影分身 SHADOW CLONE', cx, cy + 120);

    ctx.fillStyle = '#ffffff';
    ctx.fillText('影分身 SHADOW CLONE', cx, cy + 120);

    ctx.font = '700 18px -apple-system, sans-serif';
    ctx.fillStyle = '#bae6fd';
    ctx.fillText('KAGE BUNSHIN NO JUTSU', cx, cy + 160);
  }

  // Update and draw particles if any
  if (effect.particles && effect.particles.length > 0) {
    for (const p of effect.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      const lifeRatio = p.life / p.maxLife;
      p.alpha = Math.max(0, 1 - lifeRatio);

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, p.size * (1 - lifeRatio * 0.5)), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

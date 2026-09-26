import { HandData, Particle, HandGesture, BrushMode } from '../types/tracker';

export class VisualEffectsEngine {
  private particles: Particle[] = [];
  private maxParticles = 350;
  private shockwaves: { x: number; y: number; radius: number; maxRadius: number; color: string; alpha: number }[] = [];

  public update(width: number, height: number, hand: HandData | null) {
    // 1. Spawn particles depending on active hand gesture
    if (hand) {
      this.spawnGestureParticles(hand, width, height);
    }

    // 2. Physics update for particles
    const nextParticles: Particle[] = [];
    for (const p of this.particles) {
      p.life++;
      if (p.life >= p.maxLife) continue;

      // Handle gesture influence on existing particles
      if (hand) {
        const dx = hand.palmCenter.x - p.x;
        const dy = hand.palmCenter.y - p.y;
        const d = Math.hypot(dx, dy);

        if (hand.gesture === 'OPEN_PALM') {
          // Repulsive forcefield
          if (d < 260 && d > 5) {
            const force = (1 - d / 260) * 14;
            p.vx -= (dx / d) * force;
            p.vy -= (dy / d) * force;
          }
        } else if (hand.gesture === 'FIST') {
          // Gravitational black hole singularity
          if (d > 10 && d < 400) {
            const force = (1 - d / 400) * 8;
            p.vx += (dx / d) * force;
            p.vy += (dy / d) * force;
            // Add slight angular vortex spin
            p.vx += (-dy / d) * 3;
            p.vy += (dx / d) * 3;
          }
        }
      }

      // Special particle physics
      if (p.type === 'sakura') {
        // Drifting petal flutter
        p.vx += Math.sin(p.life * 0.08) * 0.4;
        p.vy += 0.03; // Gentle gravity
        if (p.rotation !== undefined && p.vRot !== undefined) {
          p.rotation += p.vRot;
        }
      } else if (p.type === 'ember') {
        // Rising heat flame
        p.vy -= 0.15;
        p.vx += (Math.random() - 0.5) * 0.8;
      } else if (p.type === 'star') {
        // Decelerating burst
        p.vx *= 0.94;
        p.vy *= 0.94;
      } else {
        p.vx *= 0.96;
        p.vy *= 0.96;
      }

      p.x += p.vx;
      p.y += p.vy;

      const progress = p.life / p.maxLife;
      p.alpha = Math.max(0, 1 - progress);

      nextParticles.push(p);
    }

    this.particles = nextParticles.slice(0, this.maxParticles);

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += 12;
      sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
      if (sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  public triggerShockwave(x: number, y: number, color: string = '#06b6d4', maxRadius: number = 240) {
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius,
      color,
      alpha: 1,
    });
  }

  public spawnGestureParticles(hand: HandData, _w: number, _h: number) {
    const { gesture, indexTip, palmCenter, palmSize } = hand;

    switch (gesture) {
      case 'ROCK_ON': {
        // Spawn rising fire dragon embers from index & pinky tips
        for (let i = 0; i < 4; i++) {
          const origin = Math.random() > 0.5 ? hand.indexTip : hand.pinkyTip;
          this.particles.push({
            x: origin.x + (Math.random() - 0.5) * 16,
            y: origin.y + (Math.random() - 0.5) * 16,
            vx: (Math.random() - 0.5) * 3,
            vy: -2 - Math.random() * 4,
            size: 4 + Math.random() * 8,
            color: Math.random() > 0.4 ? '#f97316' : '#eab308',
            alpha: 1,
            life: 0,
            maxLife: 25 + Math.random() * 20,
            type: 'ember',
          });
        }
        break;
      }

      case 'PEACE': {
        // Spawn Sakura cherry blossom petals around the hand
        if (Math.random() > 0.4) {
          const angle = Math.random() * Math.PI * 2;
          const radius = palmSize * 0.8 + Math.random() * 80;
          this.particles.push({
            x: palmCenter.x + Math.cos(angle) * radius,
            y: palmCenter.y + Math.sin(angle) * radius,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 0.8 + Math.random() * 1.8,
            size: 6 + Math.random() * 7,
            color: Math.random() > 0.3 ? '#f472b6' : '#fda4af',
            alpha: 0.9,
            life: 0,
            maxLife: 60 + Math.random() * 40,
            type: 'sakura',
            rotation: Math.random() * Math.PI,
            vRot: (Math.random() - 0.5) * 0.08,
          });
        }
        break;
      }

      case 'POINT': {
        // Plasma spark stream firing from the index finger
        for (let i = 0; i < 3; i++) {
          const angle = Math.atan2(indexTip.y - palmCenter.y, indexTip.x - palmCenter.x);
          const spread = (Math.random() - 0.5) * 0.4;
          const speed = 6 + Math.random() * 10;
          this.particles.push({
            x: indexTip.x,
            y: indexTip.y,
            vx: Math.cos(angle + spread) * speed,
            vy: Math.sin(angle + spread) * speed,
            size: 2.5 + Math.random() * 4,
            color: Math.random() > 0.5 ? '#38bdf8' : '#818cf8',
            alpha: 1,
            life: 0,
            maxLife: 20 + Math.random() * 15,
            type: 'spark',
          });
        }
        break;
      }

      case 'THUMBS_UP': {
        // Golden stars exploding
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 3 + Math.random() * 9;
          this.particles.push({
            x: hand.thumbTip.x,
            y: hand.thumbTip.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 4 + Math.random() * 6,
            color: Math.random() > 0.4 ? '#facc15' : '#ffffff',
            alpha: 1,
            life: 0,
            maxLife: 30 + Math.random() * 25,
            type: 'star',
          });
        }
        break;
      }

      case 'FIST': {
        // Gravitational singularity inward vortex & dark lightning
        for (let i = 0; i < 4; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 80 + Math.random() * 120;
          this.particles.push({
            x: palmCenter.x + Math.cos(angle) * dist,
            y: palmCenter.y + Math.sin(angle) * dist,
            vx: -Math.cos(angle) * 5,
            vy: -Math.sin(angle) * 5,
            size: 3 + Math.random() * 5,
            color: Math.random() > 0.3 ? '#ef4444' : '#7f1d1d',
            alpha: 1,
            life: 0,
            maxLife: 25,
            type: 'gravity',
          });
        }
        break;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, hand: HandData | null) {
    ctx.save();

    // 1. Render Shockwaves
    for (const sw of this.shockwaves) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = sw.alpha * 0.7;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Render Active Particles
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;

      if (p.type === 'sakura') {
        // Draw delicate sakura petal oval
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'star') {
        // Draw 4-point golden star
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2;
          ctx.lineTo(Math.cos(a) * p.size, Math.sin(a) * p.size);
          const a2 = a + Math.PI / 4;
          ctx.lineTo(Math.cos(a2) * (p.size * 0.3), Math.sin(a2) * (p.size * 0.3));
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        // Glowing round spark
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.size * (1 - p.life / p.maxLife * 0.4)), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Render Hand Skeleton & Gesture Hologram
    if (hand && hand.landmarks.length >= 21) {
      this.renderHandAura(ctx, hand);
    }

    ctx.restore();
  }

  private renderHandAura(ctx: CanvasRenderingContext2D, hand: HandData) {
    const lms = hand.landmarks;
    const gesture = hand.gesture;

    // Palette per gesture
    let themeColor = '#06b6d4';
    let secondaryColor = '#22d3ee';

    switch (gesture) {
      case 'PINCH':
        themeColor = '#06b6d4';
        secondaryColor = '#67e8f9';
        break;
      case 'POINT':
        themeColor = '#3b82f6';
        secondaryColor = '#93c5fd';
        break;
      case 'OPEN_PALM':
        themeColor = '#10b981';
        secondaryColor = '#6ee7b7';
        break;
      case 'PEACE':
        themeColor = '#ec4899';
        secondaryColor = '#f472b6';
        break;
      case 'FIST':
        themeColor = '#ef4444';
        secondaryColor = '#991b1b';
        break;
      case 'ROCK_ON':
        themeColor = '#f97316';
        secondaryColor = '#facc15';
        break;
      case 'THUMBS_UP':
        themeColor = '#eab308';
        secondaryColor = '#fde047';
        break;
    }

    // Bone links
    const bones = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [10, 11], [11, 12],
      [9, 13], [13, 14], [14, 15], [15, 16],
      [13, 17], [17, 18], [18, 19], [19, 20],
      [0, 17],
    ];

    // 1. Draw glowing bones
    ctx.save();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = themeColor;
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 12;
    ctx.globalAlpha = 0.85;

    for (const [start, end] of bones) {
      const p1 = lms[start];
      const p2 = lms[end];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // 2. Draw glowing joints
    for (let i = 0; i < lms.length; i++) {
      const pt = lms[i];
      const isTip = [4, 8, 12, 16, 20].includes(i);
      ctx.beginPath();
      ctx.fillStyle = isTip ? '#ffffff' : secondaryColor;
      ctx.arc(pt.x, pt.y, isTip ? 6 : 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Special Gesture Hologram & Forcefields
    if (gesture === 'OPEN_PALM') {
      // Cosmic shield aura around palm
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.beginPath();
      ctx.arc(hand.palmCenter.x, hand.palmCenter.y, hand.palmSize * 1.4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(hand.palmCenter.x, hand.palmCenter.y, hand.palmSize * 1.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (gesture === 'FIST') {
      // Gravitational dark singularity
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(hand.palmCenter.x, hand.palmCenter.y, hand.palmSize * 0.7, 0, Math.PI * 2);
      ctx.stroke();

      // Red lightning tendrils
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2 + (performance.now() * 0.005);
        ctx.beginPath();
        ctx.moveTo(hand.palmCenter.x, hand.palmCenter.y);
        const midX = hand.palmCenter.x + Math.cos(angle) * hand.palmSize * 0.6 + (Math.random() - 0.5) * 15;
        const midY = hand.palmCenter.y + Math.sin(angle) * hand.palmSize * 0.6 + (Math.random() - 0.5) * 15;
        const endX = hand.palmCenter.x + Math.cos(angle) * hand.palmSize * 1.3;
        const endY = hand.palmCenter.y + Math.sin(angle) * hand.palmSize * 1.3;
        ctx.lineTo(midX, midY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    }

    // 4. Gesture HUD Badge hovering at wrist
    const wrist = lms[0];
    const badgeY = wrist.y + 40;
    const badgeText = `${this.getGestureEmoji(gesture)} ${gesture.replace('_', ' ')}`;

    ctx.font = '600 12px monospace';
    const textWidth = ctx.measureText(badgeText).width;
    const pad = 12;

    ctx.fillStyle = 'rgba(10, 10, 14, 0.85)';
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = themeColor;

    ctx.beginPath();
    ctx.roundRect(wrist.x - textWidth / 2 - pad, badgeY - 14, textWidth + pad * 2, 26, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, wrist.x, badgeY - 1);

    ctx.restore();
  }

  private getGestureEmoji(g: HandGesture): string {
    switch (g) {
      case 'PINCH': return '👌';
      case 'POINT': return '👉';
      case 'OPEN_PALM': return '✋';
      case 'PEACE': return '✌️';
      case 'FIST': return '✊';
      case 'ROCK_ON': return '🤘';
      case 'THUMBS_UP': return '👍';
      default: return '🖐️';
    }
  }

  public clear() {
    this.particles = [];
    this.shockwaves = [];
  }
}

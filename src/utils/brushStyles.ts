import { BrushMode } from '../types/tracker';

export function renderStrokeSegment(
  ctx: CanvasRenderingContext2D,
  from: { x: number; y: number },
  to: { x: number; y: number },
  brush: BrushMode,
  baseColor: string,
  size: number
) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (brush) {
    case 'NEON': {
      // Core bright center
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(2, size * 0.45);
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = size * 3;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      // Outer colored glow aura
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = size;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      break;
    }

    case 'FIRE': {
      // Fiery gradient stroke
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = size * 1.2;
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      // Hot yellow core
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = Math.max(2, size * 0.5);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      break;
    }

    case 'CELESTIAL': {
      // Ethereal starlight violet
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = size;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      // Shimmer dots
      if (Math.random() > 0.6) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(to.x + (Math.random() - 0.5) * 8, to.y + (Math.random() - 0.5) * 8, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'RAINBOW': {
      const hue = (performance.now() * 0.15) % 360;
      const rainbowColor = `hsl(${hue}, 100%, 65%)`;
      ctx.strokeStyle = rainbowColor;
      ctx.shadowColor = rainbowColor;
      ctx.shadowBlur = 14;
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      break;
    }

    case 'CYBER':
    default: {
      ctx.strokeStyle = baseColor;
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = 10;
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

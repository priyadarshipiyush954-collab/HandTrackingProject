import { KeyBox, LETTERS } from '../types/tracker';

export function getKeyBoxes(canvasWidth: number, canvasHeight: number): KeyBox[] {
  const cols = 7;
  // Calculate responsive key sizes
  const availableWidth = Math.min(canvasWidth - 40, 580);
  const key_w = Math.floor((availableWidth - (cols - 1) * 8) / cols);
  const key_h = Math.max(38, Math.min(48, Math.floor(key_w * 0.75)));
  
  // Position keyboard in bottom-left or bottom center
  const margin_x = Math.max(20, Math.floor((canvasWidth - (cols * (key_w + 8) - 8)) / 2));
  const rows = Math.ceil(LETTERS.length / cols);
  const totalKeyboardHeight = rows * (key_h + 8);
  const margin_y = Math.max(120, canvasHeight - totalKeyboardHeight - 24);

  const boxes: KeyBox[] = [];

  for (let i = 0; i < LETTERS.length; i++) {
    const letter = LETTERS[i];
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x1 = margin_x + col * (key_w + 8);
    const y1 = margin_y + row * (key_h + 8);
    const x2 = x1 + key_w;
    const y2 = y1 + key_h;
    const display = letter === '_' ? 'SPACE' : letter === '<' ? 'DEL' : letter;

    boxes.push({ x1, y1, x2, y2, letter, display });
  }

  return boxes;
}

export function getHoverKey(point: { x: number; y: number } | null, boxes: KeyBox[]): number | null {
  if (!point) return null;
  const { x, y } = point;
  for (let i = 0; i < boxes.length; i++) {
    const b = boxes[i];
    if (x >= b.x1 && x <= b.x2 && y >= b.y1 && y <= b.y2) {
      return i;
    }
  }
  return null;
}

export function drawKeyboardOnCanvas(
  ctx: CanvasRenderingContext2D,
  boxes: KeyBox[],
  selectedIdx: number | null,
  activeKeyIdx: number | null
) {
  ctx.save();

  // Background container for keyboard
  if (boxes.length > 0) {
    const minX = Math.min(...boxes.map(b => b.x1)) - 10;
    const minY = Math.min(...boxes.map(b => b.y1)) - 10;
    const maxX = Math.max(...boxes.map(b => b.x2)) + 10;
    const maxY = Math.max(...boxes.map(b => b.y2)) + 10;

    ctx.fillStyle = 'rgba(15, 15, 20, 0.78)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(minX, minY, maxX - minX, maxY - minY, 12);
    ctx.fill();
    ctx.stroke();

    // Keyboard header label
    ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
    ctx.font = '600 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('GESTURE KEYBOARD (PINCH KEY TO TYPE)', minX + 8, minY - 6);
  }

  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    const isHover = selectedIdx === i;
    const isPressed = activeKeyIdx === i;

    const w = box.x2 - box.x1;
    const h = box.y2 - box.y1;

    // Box fill
    if (isPressed) {
      ctx.fillStyle = '#ef4444'; // Red on pressed
    } else if (isHover) {
      ctx.fillStyle = '#00dcff'; // Cyan on hover, matching python (0, 220, 255)
    } else {
      ctx.fillStyle = 'rgba(38, 38, 42, 0.9)'; // Dark key
    }

    ctx.beginPath();
    ctx.roundRect(box.x1, box.y1, w, h, 6);
    ctx.fill();

    // Border
    ctx.strokeStyle = isHover ? '#ffffff' : 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = isHover ? 2.5 : 1.5;
    ctx.stroke();

    // Letter text
    ctx.font = box.display.length > 1 ? '700 13px -apple-system, sans-serif' : '700 18px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isHover || isPressed ? '#000000' : '#ffffff';
    ctx.fillText(box.display, box.x1 + w / 2, box.y1 + h / 2);
  }

  ctx.restore();
}

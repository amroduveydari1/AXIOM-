
import { LogoMetrics } from "../types";

export const getLogoMetrics = async (imageSrc: string): Promise<LogoMetrics> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return reject('Could not create canvas context');

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
      let totalAlpha = 0;
      let sumX = 0;
      let sumY = 0;
      let filledPixels = 0;

      // Weights for quadrants
      let weightL = 0, weightR = 0, weightT = 0, weightB = 0;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          const alpha = data[idx + 3];

          if (alpha > 0) {
            filledPixels++;
            // Bounding box
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;

            // Center of mass
            totalAlpha += alpha;
            sumX += x * alpha;
            sumY += y * alpha;

            // Quadrant weights
            if (x < canvas.width / 2) weightL += alpha;
            else weightR += alpha;

            if (y < canvas.height / 2) weightT += alpha;
            else weightB += alpha;
          }
        }
      }

      const centerX = sumX / totalAlpha;
      const centerY = sumY / totalAlpha;

      const diffV = Math.abs(weightL - weightR) / totalAlpha;
      const diffH = Math.abs(weightT - weightB) / totalAlpha;

      const getSymmetry = (diff: number) => {
        if (diff < 0.05) return 'high';
        if (diff < 0.15) return 'medium';
        return 'low';
      };

      const bbWidth = maxX - minX;
      const bbHeight = maxY - minY;
      const density = (filledPixels / (bbWidth * bbHeight)) * 100;

      resolve({
        width: canvas.width,
        height: canvas.height,
        aspect_ratio: img.width / img.height,
        symmetry_vertical: getSymmetry(diffV),
        symmetry_horizontal: getSymmetry(diffH),
        center_offset_x: ((centerX - canvas.width / 2) / canvas.width) * 100,
        center_offset_y: ((centerY - canvas.height / 2) / canvas.height) * 100,
        weight_left: (weightL / totalAlpha) * 100,
        weight_right: (weightR / totalAlpha) * 100,
        weight_top: (weightT / totalAlpha) * 100,
        weight_bottom: (weightB / totalAlpha) * 100,
        density,
        complexity_index: filledPixels / (canvas.width + canvas.height), // simple heuristic
        boundingBox: {
          x: minX,
          y: minY,
          width: bbWidth,
          height: bbHeight
        },
        centerOfMass: {
          x: centerX,
          y: centerY
        }
      });
    };

    img.onerror = reject;
  });
};

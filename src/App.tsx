import { useState, useRef, useEffect } from "react";
import { DEFAULT_MATRIX } from "./constants";
import { convertMatrixStringToArray, isValidMatrix } from "./utils";

const matrixDescriptions = [
  "Red from Red",
  "Red from Green",
  "Red from Blue",
  "Red from Alpha",
  "Red Bias",
  "Green from Red",
  "Green from Green",
  "Green from Blue",
  "Green from Alpha",
  "Green Bias",
  "Blue from Red",
  "Blue from Green",
  "Blue from Blue",
  "Blue from Alpha",
  "Blue Bias",
  "Alpha from Red",
  "Alpha from Green",
  "Alpha from Blue",
  "Alpha from Alpha",
  "Alpha Bias",
];

const initialMatrix: number[] = [
  1.5, 0.1, 0.1, 0.0, 0.0, 0.2, 1.2, 0.2, 0.0, 0.0, 0.3, 0.3, 1.2, 0.0, 0.0,
  0.0, 0.0, 0.0, 1.0, 0.0,
];

function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [matrix, setMatrix] = useState<number[]>([...initialMatrix]);
  const [customMatrix, setCustomMatrix] = useState<string | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const transformedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle file input to load the image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const applyColorMatrix = () => {
    if (!image || !originalCanvasRef.current || !transformedCanvasRef.current)
      return;

    const originalCanvas = originalCanvasRef.current;
    const transformedCanvas = transformedCanvasRef.current;
    const originalCtx = originalCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    const transformedCtx = transformedCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (originalCtx && transformedCtx) {
      // Set the max height for the transformed image
      const maxHeight = 300;

      // Calculate the scale based on max height while maintaining aspect ratio
      const scaleFactor = maxHeight / image.height;
      const newWidth = image.width * scaleFactor;

      // Scale and draw the original image on the original canvas
      originalCanvas.width = image.width;
      originalCanvas.height = image.height;
      originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height); // Clear canvas before drawing
      originalCtx.drawImage(image, 0, 0, image.width, image.height); // Draw original image without scaling

      // Set the canvas size for the transformed image (scaled image)
      transformedCanvas.width = newWidth;
      transformedCanvas.height = maxHeight;
      transformedCtx.clearRect(
        0,
        0,
        transformedCanvas.width,
        transformedCanvas.height
      ); // Clear canvas before drawing
      transformedCtx.drawImage(image, 0, 0, newWidth, maxHeight); // Draw the image scaled

      // Get image data from transformed canvas (now at scaled size)
      const imageData = transformedCtx.getImageData(
        0,
        0,
        transformedCanvas.width,
        transformedCanvas.height
      );
      const data = imageData.data;

      // Apply the color matrix transformation to each pixel
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        data[i] = clamp(
          matrix[0] * r +
            matrix[1] * g +
            matrix[2] * b +
            matrix[3] * a +
            matrix[4]
        );
        data[i + 1] = clamp(
          matrix[5] * r +
            matrix[6] * g +
            matrix[7] * b +
            matrix[8] * a +
            matrix[9]
        );
        data[i + 2] = clamp(
          matrix[10] * r +
            matrix[11] * g +
            matrix[12] * b +
            matrix[13] * a +
            matrix[14]
        );
        data[i + 3] = clamp(
          matrix[15] * r +
            matrix[16] * g +
            matrix[17] * b +
            matrix[18] * a +
            matrix[19]
        );
      }

      // Put the transformed data into the transformed canvas
      transformedCtx.putImageData(imageData, 0, 0);
    }
  };

  // Handle matrix input changes
  const handleMatrixChange = (index: number, value: string) => {
    const newMatrix = [...matrix];
    newMatrix[index] = parseFloat(value);
    setMatrix(newMatrix);
  };

  // Clamp values to the 0-255 range
  const clamp = (value: number): number => Math.max(0, Math.min(255, value));

  useEffect(() => {
    applyColorMatrix();
  }, [image, matrix]);

  const handleReset = () => {
    setMatrix(DEFAULT_MATRIX);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(
      `[${matrix.map((v) => v.toFixed(1)).join(", ")}]`
    );
  };

  const handleApplyCustom = () => {
    if (!customMatrix || !isValidMatrix(customMatrix)) return;
    const newMatrix = convertMatrixStringToArray(customMatrix);
    setMatrix(newMatrix);
  };

  return (
    <div>
      <div className="flex-column-start">
        <h4>Color Matrix Visualizer</h4>
        <input type="file" onChange={handleImageUpload} accept="image/*" />
        <button onClick={handleReset}>Reset to Defaults</button>
      </div>
      <div className="container">
        <div>
          <h3>Original Image</h3>
          <canvas ref={originalCanvasRef} />
        </div>
        <div>
          <h3>Transformed Image</h3>
          <canvas ref={transformedCanvasRef} />
        </div>
      </div>

      <h4>Adjust Color Matrix</h4>
      <div className="controls">
        <div className="flex-row flex-center sp-1">
          {matrixDescriptions.slice(0, 5).map((description, index) => (
            <div className="control-group" key={index}>
              <label>{description}</label>
              <input
                type="number"
                value={matrix[index]}
                step="0.1"
                onChange={(e) => handleMatrixChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="flex-row flex-center sp-1">
          {matrixDescriptions.slice(5, 10).map((description, index) => (
            <div className="control-group" key={index}>
              <label>{description}</label>
              <input
                type="number"
                value={matrix[index]}
                step="0.1"
                onChange={(e) => handleMatrixChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="flex-row flex-center sp-1">
          {matrixDescriptions.slice(10, 15).map((description, index) => (
            <div className="control-group" key={index}>
              <label>{description}</label>
              <input
                type="number"
                value={matrix[index]}
                step="0.1"
                onChange={(e) => handleMatrixChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="flex-row flex-center sp-1">
          {matrixDescriptions.slice(15).map((description, index) => (
            <div className="control-group" key={index}>
              <label>{description}</label>
              <input
                type="number"
                value={matrix[index]}
                step="0.1"
                onChange={(e) => handleMatrixChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-row-center">
        <div className="flex flex-column-start sp-1">
          <label style={{ fontWeight: "bold" }}>Matrix:</label>
          <textarea
            readOnly
            rows={4}
            value={`[${matrix.map((v) => v.toFixed(1)).join(", ")}]`}
          />
          <button onClick={handleCopyToClipboard}>Copy Matrix</button>
        </div>
        <div className="flex-center flex-column">
          <div className="flex-center sp-1 flex-column">
            <label style={{ fontWeight: "bold" }}>Custom Matrix</label>
            <textarea
              value={customMatrix ?? ""}
              onChange={(e) => setCustomMatrix(e.target.value)}
            />
          </div>
          <div className="flex-center flex-row sp-1 p-2">
            <button onClick={handleApplyCustom}>apply custom</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

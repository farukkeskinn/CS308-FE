
import React from "react";

const ThreeDFrame = ({
  text = "Create your account to get started with Neptune",
  textSize = "1.5rem",
  textColor = "#ffffff",
  fontFamily = "Arial, sans-serif",
  frameColor = "#1f1c66",
  frameThickness = "4px",
  depth = "8px",
  padding = "10px 20px", // Kutu küçültüldü
  borderRadius = "8px" // Köşeler biraz daha yuvarlatıldı
}) => {
  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        padding: padding,
        fontSize: textSize,
        color: textColor,
        fontFamily: fontFamily,
        backgroundColor: frameColor,
        borderRadius: borderRadius,
        boxShadow: `0 ${depth} ${depth} rgba(0, 0, 0, 0.3)`,
        border: `${frameThickness} solid ${frameColor}`,
        textAlign: "center",
        userSelect: "none",
        transition: "transform 0.3s ease-in-out",
      }}
    >
      {text}
    </div>
  );
};

export default ThreeDFrame;

import React from "react";
// cards
import { parts } from "../parts/parts";

const CarRenderer = ({ car = null, size = 200, style }) => {
  if (!car) {
    return null;
  }

  let vinStr = String(car.vin);

  while (vinStr.length < 16) vinStr = "0" + vinStr;

  let carDetails = {
    bg: vinStr.substring(0, 2) % 5 ,
    carType: vinStr.substring(2, 4) % 5,
    item: vinStr.substring(4, 6) % 5,
    trap: vinStr.substring(6, 8) % 5,
    car: vinStr.substring(8, 10) %5,
    name: car.name,
  };

  const carStyle = {
    width: "100%",
    height: "100%",
    position: "absolute",
  };



  return (
      <div
      style={{
          minWidth: size,
          minHeight: size,
          background: "blue",
          position: "relative",
          ...style,

        }}
        >
      <img alt={"bg"} src={parts.bg[carDetails.bg]} style={carStyle} />
      <img alt={"line"} src={parts.allCars[car.id]} style={carStyle} />
    </div>
  );
};

export default CarRenderer;
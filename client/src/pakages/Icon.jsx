import { useEffect, useState } from "react";
import { 
  Md4gMobiledata, Md4gPlusMobiledata, MdLteMobiledata, MdSignalCellularAlt, MdBatteryChargingFull, MdSimCard 
} from "react-icons/md";
import { FiPhone, FiMessageCircle } from "react-icons/fi";
import { BsWifi } from "react-icons/bs";
import { FaMoneyBillWave, FaBolt } from "react-icons/fa";
import { AiOutlineCreditCard, AiOutlineMobile, AiOutlineCloud } from "react-icons/ai";
import { BiCoin } from "react-icons/bi";
import { IoMdPower, IoMdPlanet } from "react-icons/io";

const icons = [
  Md4gMobiledata, Md4gPlusMobiledata, MdLteMobiledata, FiPhone, FiMessageCircle, 
  BsWifi, MdSignalCellularAlt, FaMoneyBillWave, AiOutlineCreditCard, MdBatteryChargingFull, 
  BiCoin, MdSimCard, AiOutlineMobile, IoMdPower, AiOutlineCloud, FaBolt, IoMdPlanet,
];

const Icon = () => {
  const [positions, setPositions] = useState([]);

  const generatePositions = (cols, rows) => {
    const iconSize = Math.min(window.innerWidth, window.innerHeight) / 15; // Dynamically scale icon size
    const colWidth = window.innerWidth / cols; // Width of each grid column
    const rowHeight = window.innerHeight / rows; // Height of each grid row

    const generatedPositions = [];
    let iconIndex = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const randomTopOffset = Math.random() * (rowHeight - iconSize); // Random offset within the cell
        const randomLeftOffset = Math.random() * (colWidth - iconSize); // Random offset within the cell
        const top = row * rowHeight + randomTopOffset; // Add offset to row position
        const left = col * colWidth + randomLeftOffset; // Add offset to column position

        generatedPositions.push({ top, left, icon: icons[iconIndex] });
        iconIndex = (iconIndex + 1) % icons.length; // Loop through icons if we run out
      }
    }

    return generatedPositions;
  };

  useEffect(() => {
    const cols = 4; // Number of columns
    const rows = 4; // Number of rows
    setPositions(generatePositions(cols, rows));

    const handleResize = () => {
      setPositions(generatePositions(cols, rows));
    };

    const debouncedResize = debounce(handleResize, 300);
    window.addEventListener("resize", debouncedResize);

    return () => window.removeEventListener("resize", debouncedResize);
  }, []);

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  return (
    <div className="relative w-full h-full">
      {positions.map((pos, index) => {
        const IconComponent = pos.icon;
        return (
          <IconComponent
            key={index}
            className="absolute text-black opacity-50"
            style={{
              top: `${pos.top}px`,
              left: `${pos.left}px`,
              fontSize: `${Math.min(window.innerWidth, window.innerHeight) / 15}px`, // Dynamically scale font size
            }}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
};

export default Icon;

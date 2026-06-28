import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const FadeOutSection = ({ id, className, children, delayPercentage = 0.5 }) => {
  const ref = useRef(null);
  const [offsetTop, setOffsetTop] = useState(0);
  const [sectionHeight, setSectionHeight] = useState(0); 

  useEffect(() => {
    const updatePosition = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setOffsetTop(rect.top + window.scrollY);
        setSectionHeight(rect.height); 
      }
    };
    
    updatePosition(); 
    window.addEventListener("resize", updatePosition); 
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  const { scrollY } = useScroll();

  const startPoint = offsetTop + (sectionHeight * delayPercentage);

  // Der Inhalt fadet aus
  const contentOpacity = useTransform(scrollY, [startPoint, startPoint + 400], [1, 0]);
  
  // Der Text rutscht nach unten
  const y = useTransform(scrollY, [startPoint, startPoint + 500], [0, 150]);
  
  // Das "Blackout"-Overlay fadet weich ein
  const overlayOpacity = useTransform(scrollY, [startPoint + 100, startPoint + 500], [0, 1]);

  // Automatisches Trennen von Hintergrund-Elementen und Text-Inhalt
  const childrenArray = React.Children.toArray(children);
  const backgroundChildren = [];
  const contentChildren = [];

  childrenArray.forEach((child) => {
    if (React.isValidElement(child)) {
      const componentName = child.type?.name || (typeof child.type === "string" ? child.type : "");
      const classNameProp = child.props?.className || "";
      
      // Erkennt Hintergründe, Glow-Effekte oder Linien an ihren Bezeichnern
      const isBackground = 
        componentName.toLowerCase().includes("glow") ||
        componentName.toLowerCase().includes("flow") ||
        classNameProp.toLowerCase().includes("glow") ||
        classNameProp.toLowerCase().includes("background") ||
        classNameProp.toLowerCase().includes("flow") ||
        classNameProp.toLowerCase().includes("effect");

      if (isBackground) {
        backgroundChildren.push(child);
      } else {
        contentChildren.push(child);
      }
    } else {
      contentChildren.push(child);
    }
  });

  return (
    <section id={id} className={className} ref={ref} style={{ position: "relative" }}>
      
      {/* 1. HINTERGRUND-EBENE: Fadet aus, wird aber NIEMALS mit 'y' verschoben. Verhindert das Abschneiden der Blurs. */}
      {backgroundChildren.length > 0 && (
        <motion.div 
          style={{ 
            opacity: contentOpacity, 
            position: "absolute", 
            inset: 0, 
            pointerEvents: "none",
            overflow: "visible" 
          }}
        >
          {backgroundChildren}
        </motion.div>
      )}

      {/* 2. INHALTS-EBENE: Text und Karten bewegen sich flüssig nach unten */}
      <motion.div style={{ opacity: contentOpacity, y, width: "100%" }}>
        {contentChildren}
      </motion.div>

      {/* 3. OVERLAY-EBENE: Wechselt nahtlos zu absolutem Schwarz */}
      <motion.div 
        style={{ 
          opacity: overlayOpacity,
          position: "absolute",
          inset: 0,
          backgroundColor: "#000000", 
          pointerEvents: "none",      
          zIndex: 50                  
        }} 
      />
      
    </section>
  );
};

export default FadeOutSection;
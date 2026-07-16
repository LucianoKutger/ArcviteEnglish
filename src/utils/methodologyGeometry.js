export const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

export const getPointyArcPath = (
  centerX,
  centerY,
  radius,
  startAngle,
  endAngle,
  thickness
) => {
  const startPoint = polarToCartesian(centerX, centerY, radius, startAngle);

  const endPoint = polarToCartesian(centerX, centerY, radius, endAngle);

  const outerRadius = radius + thickness / 2;
  const innerRadius = radius - thickness / 2;

  return [
    'M',
    startPoint.x,
    startPoint.y,
    'A',
    outerRadius,
    outerRadius,
    0,
    0,
    1,
    endPoint.x,
    endPoint.y,
    'A',
    innerRadius,
    innerRadius,
    0,
    0,
    0,
    startPoint.x,
    startPoint.y,
    'Z',
  ].join(' ');
};

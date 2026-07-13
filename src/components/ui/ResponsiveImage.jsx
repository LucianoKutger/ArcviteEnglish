const ResponsiveImage = ({ image, variant, sizes, pictureClassName, ...imageProps }) => {
  const sources = image.sources[variant];

  return (
    <picture className={pictureClassName}>
      {sources.avif && (
        <source type="image/avif" srcSet={sources.avif} sizes={sizes} />
      )}
      {sources.webp && (
        <source type="image/webp" srcSet={sources.webp} sizes={sizes} />
      )}
      <img src={image.fallback} alt="" {...imageProps} />
    </picture>
  );
};

export default ResponsiveImage;

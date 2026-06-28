import bentoStyles from './BentoCard.module.scss'; 

const BentoCard = ({ title, subtitle, icon, children, className = "" }) => (
  <div className={`${bentoStyles.card} ${className}`}>
    <div className={bentoStyles.glowOverlay} />
    
    <div className={bentoStyles.content}>
      {icon && (
        <div className={bentoStyles.iconWrapper}>
          {icon}
        </div>
      )}
      
      <h3 className={bentoStyles.title}>{title}</h3>
      
      {subtitle && (
        <p className={bentoStyles.subtitle}>{subtitle}</p>
      )}
      
      <div className={bentoStyles.childrenContainer}>
        {children}
      </div>
    </div>
  </div>
);

export default BentoCard;
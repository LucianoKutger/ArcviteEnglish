import logoStyles from './ArcviteLogo.module.scss';
import { imageSizes, logoImage } from '../../data/responsiveImages';
import ResponsiveImage from './ResponsiveImage';

const ArcviteLogo = () => (
    <div className={logoStyles.logoContainer}>
        <ResponsiveImage
          image={logoImage}
          variant="display"
          sizes={imageSizes.logo}
          pictureClassName={logoStyles.logoPicture}
          alt="Arcvite Logo"
        />
    </div>
);

export default ArcviteLogo;

import logoStyles from './ArcviteLogo.module.scss';
import ArcviteLogoPic from '../../assets/ArcviteLogoPic.png'

const ArcviteLogo = () => (
    <div className={logoStyles.logoContainer}>
        <img src={ArcviteLogoPic} alt='Arcvite Logo'/>
    </div>
);

export default ArcviteLogo;
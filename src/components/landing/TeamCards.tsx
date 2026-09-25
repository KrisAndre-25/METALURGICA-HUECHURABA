import { IconBrandGithub, IconBrandLinkedin, type Icon } from '@tabler/icons-react';
import './teamCard3d.css';

interface SocialLink {
  icon: Icon;
  label: string;
  href: string;
}

interface TeamMemberCardProps {
  name: string;
  role: string;
  specialty: string;
  bio: string;
  imgSrc: string;
  imgAlt: string;
  /** Encuadre de la foto dentro del círculo (CSS `object-position`). */
  imgPosition?: string;
  /** Acercamiento a la cara para fotos de cuerpo entero (escala + punto de origen). */
  imgZoom?: { scale: number; origin: string };
  socials: SocialLink[];
}

/**
 * Tarjeta 3D de equipo (diseño de Uiverse, om_5409, en paleta DMAIX): pila de
 * círculos de vidrio con la foto al centro, que se inclina en 3D con hover o
 * foco de teclado. Estilos en teamCard3d.css.
 */
function TeamMemberCard({ name, role, specialty, bio, imgSrc, imgAlt, imgPosition = 'center', imgZoom, socials }: TeamMemberCardProps) {
  return (
    <div className="tc3d-parent">
      <article className="tc3d-card">
        <div className="tc3d-logo" aria-hidden>
          <span className="tc3d-circle tc3d-circle1" />
          <span className="tc3d-circle tc3d-circle2" />
          <span className="tc3d-circle tc3d-circle3" />
        </div>
        <div className="tc3d-logo">
          <span className="tc3d-circle tc3d-photo">
            <img
              src={imgSrc}
              alt={imgAlt}
              loading="lazy"
              style={{
                objectPosition: imgPosition,
                ...(imgZoom && { transform: `scale(${imgZoom.scale})`, transformOrigin: imgZoom.origin }),
              }}
            />
          </span>
        </div>
        <div className="tc3d-glass" />
        <div className="tc3d-content">
          <h3 className="tc3d-title">{name}</h3>
          <span className="tc3d-role">{role}</span>
          <span className="tc3d-specialty">{specialty}</span>
          <p className="tc3d-text">{bio}</p>
        </div>
        <div className="tc3d-bottom">
          <div className="tc3d-socials">
            {socials.map(({ icon: SocialIcon, label, href }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="tc3d-social">
                <SocialIcon className="size-[18px]" stroke={2} />
              </a>
            ))}
          </div>
          <span className="tc3d-brand">DMAIX</span>
        </div>
      </article>
    </div>
  );
}

type TranslatedCardProps = Pick<TeamMemberCardProps, 'name' | 'role' | 'specialty' | 'bio'> & {
  /** Texto accesible de los enlaces a perfiles (viene traducido desde Home). */
  githubLabel?: string;
  linkedinLabel?: string;
};

/** Tarjeta 3D de Kristopher Astudillo con su foto y enlaces a GitHub y LinkedIn. */
export function KristopherCard({ githubLabel = 'GitHub', linkedinLabel = 'LinkedIn', ...props }: TranslatedCardProps) {
  return (
    <TeamMemberCard
      {...props}
      imgSrc="/kristopher.jpg"
      imgAlt="Kristopher Astudillo"
      imgPosition="center 15%"
      socials={[
        { icon: IconBrandGithub, label: githubLabel, href: 'https://github.com/kristopher-astudillo' },
        { icon: IconBrandLinkedin, label: linkedinLabel, href: 'https://www.linkedin.com/in/kristopher-astudillo-dur%C3%A1n-b69083312/' },
      ]}
    />
  );
}

/** Tarjeta 3D de Yojan Chacón con su foto y enlace a LinkedIn. */
export function YojanCard({ linkedinLabel = 'LinkedIn', ...props }: TranslatedCardProps) {
  return (
    <TeamMemberCard
      {...props}
      imgSrc="/yojan.jpeg"
      imgAlt="Yojan Chacón"
      imgPosition="top"
      // Foto de cuerpo entero: se acerca a la cara (arriba al centro).
      imgZoom={{ scale: 1.8, origin: '50% 24%' }}
      socials={[{ icon: IconBrandLinkedin, label: linkedinLabel, href: 'https://www.linkedin.com/in/yojan-alirio-chacon-rujano/' }]}
    />
  );
}

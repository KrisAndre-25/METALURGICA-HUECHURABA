import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lens } from '../ui/lens';
import { Rays } from './Rays';
import { Beams } from './Beams';
import { cn } from '../ui/cn';

interface TeamMemberCardProps {
  name: string;
  role: string;
  specialty: string;
  bio: string;
  imgSrc: string;
  imgAlt: string;
  imgClassName?: string;
}

function TeamMemberCard({ name, role, specialty, bio, imgSrc, imgAlt, imgClassName }: TeamMemberCardProps) {
  const [hovering, setHovering] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-r from-[#1D2235] to-[#121318] p-8">
      <Rays />
      <Beams />
      <div className="relative z-10">
        <Lens hovering={hovering} setHovering={setHovering}>
          <img src={imgSrc} alt={imgAlt} className={cn('h-64 w-full rounded-2xl object-cover', imgClassName)} />
        </Lens>
        <motion.div animate={{ filter: hovering ? 'blur(2px)' : 'blur(0px)' }} className="relative z-20 py-4">
          <h3 className="text-left text-2xl font-bold text-white">{name}</h3>
          <p className="mt-1 text-left text-sm font-medium text-cyan-400">{role}</p>
          <p className="mt-1 text-left text-xs text-emerald-400">{specialty}</p>
          <p className="mt-3 text-left text-xs leading-relaxed text-neutral-300">{bio}</p>
        </motion.div>
      </div>
    </div>
  );
}

type TranslatedCardProps = Omit<TeamMemberCardProps, 'imgSrc' | 'imgAlt' | 'imgClassName'>;

/** Tarjeta de Kristopher Astudillo con el efecto Lens sobre su foto de retrato. */
export function KristopherCard(props: TranslatedCardProps) {
  return <TeamMemberCard {...props} imgSrc="/kristopher.jpg" imgAlt="Kristopher Astudillo" imgClassName="object-[center_15%]" />;
}

/** Tarjeta de Yojan Chacón con el efecto Lens sobre su foto de retrato. */
export function YojanCard(props: TranslatedCardProps) {
  return <TeamMemberCard {...props} imgSrc="/yojan.jpeg" imgAlt="Yojan Chacón" imgClassName="object-top" />;
}

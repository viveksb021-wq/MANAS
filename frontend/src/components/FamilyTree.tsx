import React, { useMemo } from 'react';
import { Volume2, Heart, Sparkles, UserCheck, Users } from 'lucide-react';
import { FamilyMember, usePatient } from '../context/PatientContext';
import { FamilyImage } from './FamilyImage';
import { speakText } from '../utils/speech';

interface FamilyTreeProps {
  customMembers?: FamilyMember[];
  onSelectMember?: (member: FamilyMember) => void;
}

interface GenerationGroup {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  colorClass: string;
  members: FamilyMember[];
}

export const FamilyTree: React.FC<FamilyTreeProps> = ({ customMembers, onSelectMember }) => {
  const { activeFamilyMembers } = usePatient();
  const members = customMembers || activeFamilyMembers;

  const generations = useMemo<GenerationGroup[]>(() => {
    const genPlus1: FamilyMember[] = [];
    const gen0: FamilyMember[] = [];
    const genMinus1: FamilyMember[] = [];
    const genMinus2: FamilyMember[] = [];
    const others: FamilyMember[] = [];

    members.forEach(member => {
      const rel = (member.relationship || '').toLowerCase();

      // Generation +1: Parents & Elders
      if (
        rel.includes('father') ||
        rel.includes('mother') ||
        rel.includes('parent') ||
        rel.includes('uncle') ||
        rel.includes('aunt')
      ) {
        genPlus1.push(member);
      }
      // Generation 0: Patient, Spouse, Siblings
      else if (
        rel.includes('patient') ||
        rel.includes('self') ||
        rel.includes('wife') ||
        rel.includes('husband') ||
        rel.includes('spouse') ||
        rel.includes('brother') ||
        rel.includes('sister') ||
        rel.includes('cousin')
      ) {
        gen0.push(member);
      }
      // Generation -1: Children, Nephews, Nieces
      else if (
        rel.includes('son') ||
        rel.includes('daughter') ||
        rel.includes('child') ||
        rel.includes('nephew') ||
        rel.includes('niece')
      ) {
        genMinus1.push(member);
      }
      // Generation -2: Grandchildren
      else if (
        rel.includes('grandson') ||
        rel.includes('granddaughter') ||
        rel.includes('grandchild')
      ) {
        genMinus2.push(member);
      } else {
        others.push(member);
      }
    });

    const groups: GenerationGroup[] = [];

    if (genPlus1.length > 0) {
      groups.push({
        id: 'gen-plus-1',
        title: 'Parents & Elders',
        subtitle: 'The roots of our family',
        icon: '🌳',
        colorClass: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
        members: genPlus1
      });
    }

    if (gen0.length > 0) {
      groups.push({
        id: 'gen-0',
        title: 'Patient, Spouse & Siblings',
        subtitle: 'Our generation & immediate companions',
        icon: '🏡',
        colorClass: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
        members: gen0
      });
    }

    if (genMinus1.length > 0) {
      groups.push({
        id: 'gen-minus-1',
        title: 'Children & Nieces / Nephews',
        subtitle: 'Next generation & dear young ones',
        icon: '🌿',
        colorClass: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
        members: genMinus1
      });
    }

    if (genMinus2.length > 0) {
      groups.push({
        id: 'gen-minus-2',
        title: 'Grandchildren',
        subtitle: 'The youngest blossoms',
        icon: '🌸',
        colorClass: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-600 dark:text-pink-400',
        members: genMinus2
      });
    }

    if (others.length > 0) {
      groups.push({
        id: 'gen-others',
        title: 'Extended Family & Loved Ones',
        subtitle: 'Cherished relatives and close circle',
        icon: '✨',
        colorClass: 'from-purple-500/20 to-violet-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400',
        members: others
      });
    }

    return groups;
  }, [members]);

  const handleSpeakMember = (m: FamilyMember, e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(`This is ${m.name}, your ${m.relationship}. ${m.notes || ''}`);
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
        <Users className="w-12 h-12 mx-auto text-slate-400 mb-3" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">No Family Members Saved</h3>
        <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Your caregiver can add family members from the Caregiver Portal to build your dynamic family tree.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-10 py-4">
      {generations.map((gen, idx) => (
        <div key={gen.id} className="relative">
          {/* Connecting vertical line to next generation */}
          {idx < generations.length - 1 && (
            <div className="absolute left-1/2 -bottom-10 w-0.5 h-10 bg-gradient-to-b from-indigo-400 to-indigo-200 dark:from-indigo-600 dark:to-indigo-900 z-0 transform -translate-x-1/2 hidden md:block" />
          )}

          {/* Generation Header Pill */}
          <div className="flex items-center justify-center mb-6 relative z-10">
            <div className={`px-5 py-2.5 rounded-full border bg-gradient-to-r ${gen.colorClass} shadow-sm backdrop-blur-md flex items-center space-x-3`}>
              <span className="text-xl" role="img" aria-label="symbol">{gen.icon}</span>
              <div className="text-center md:text-left">
                <h3 className="text-sm md:text-base font-bold tracking-wide uppercase">
                  {gen.title}
                </h3>
                <p className="text-xs opacity-80 hidden md:block">{gen.subtitle}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-white/60 dark:bg-slate-800/60 rounded-full">
                {gen.members.length}
              </span>
            </div>
          </div>

          {/* Members in Generation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 relative z-10">
            {gen.members.map(member => (
              <div
                key={member.id}
                onClick={() => onSelectMember && onSelectMember(member)}
                className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3.5 bg-slate-100 dark:bg-slate-800 shadow-inner">
                    <FamilyImage
                      src={member.photo_url || member.imagePath}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-slate-900/90 text-indigo-700 dark:text-indigo-300 shadow-sm">
                        {member.relationship}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {member.name}
                  </h4>

                  {member.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {member.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={(e) => handleSpeakMember(member, e)}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Hear Voice</span>
                  </button>

                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

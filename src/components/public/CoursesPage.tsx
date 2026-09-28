import React from 'react';
import { BookOpen, Award, CheckCircle2, Clock, Users, ArrowRight } from 'lucide-react';

interface Props {
  onApplyCourse?: (courseName: string) => void;
}

export const CoursesPage: React.FC<Props> = ({ onApplyCourse }) => {
  const courses = [
    {
      id: 'nazra-quran',
      name: 'Nazra Quran',
      arabicName: 'ناظرہ قرآن کریم',
      description: 'Foundational Quranic recitation program focusing on correct letter pronunciation (Makharij), fluent continuous reading with basic Tajweed rules, and daily revision.',
      suitableFor: 'Beginners, children (ages 4+), and new learners seeking fluent and accurate reading of the Holy Quran.',
      timing: 'Monday - Saturday: 5:00 PM - 7:00 PM',
      duration: 'Ongoing / Milestone based',
      features: [
        'Noorani Qaida completion',
        'Letter recognition and joint letters',
        'Basic waqf (stop) symbols rules',
        'Fluent reading of all 30 Paras',
        'Daily Duas and Kalimas recitation'
      ],
      tag: 'Foundational',
    },
    {
      id: 'hifzul-quran',
      name: 'Hifzul Quran',
      arabicName: 'حفظ القرآن الكريم',
      description: 'Comprehensive Quran memorization program utilizing individual 30-day Para targets, daily Sabaq, Sabaqi, and Manzil revisions with individualized monitoring.',
      suitableFor: 'Students with completed Nazra proficiency having high dedication for complete Quran memorization.',
      timing: 'Monday - Saturday: 4:00 PM - 6:00 PM',
      duration: '2 to 3 Years (Personalized pace)',
      features: [
        'Personalized 30-day Para targets',
        'Quarter-para (0.25 increment) daily tracking',
        'Daily listener (سامع) recitation review',
        'Mistake (غلطی) and stumble (اٹکاں) logging',
        'Weekly revision & retention evaluations'
      ],
      tag: 'Core Memorization',
    },
    {
      id: 'gardaan',
      name: 'Gardaan (Arabic Grammar & Morphology)',
      arabicName: 'علم الصرف والگردان',
      description: 'Systematic study of Arabic verb conjugations (Sarf) and morphological structures enabling students to comprehend Quranic grammar, root letters, and vocabulary.',
      suitableFor: 'Students who have read Quran and desire deep linguistic understanding of Arabic verbs, tenses, and Quranic grammar.',
      timing: 'Monday - Saturday: 4:00 PM - 5:00 PM',
      duration: '6 Months intensive semester',
      features: [
        'Past (Mazi) and Present (Mudari) conjugations',
        'Thulathi Mujarrad & Mazid Feeh verb scales',
        'Irregular verb patterns (Mu’tall & Muza’af)',
        'Direct vocabulary extraction from Quran',
        'Regular oral & written conjugation drills'
      ],
      tag: 'Grammar & Sarf',
    },
    {
      id: 'tajweed',
      name: 'Tajweed',
      arabicName: 'تجويد القرآن الكريم',
      description: 'Rigorous theoretical and practical training in the science of Tajweed, encompassing precise articulation points (Makharij), characteristics (Sifaat), and melodious tartil.',
      suitableFor: 'Students, Huffaz, and adults looking to refine their recitation according to the authentic rules of Hafs ‘an ‘Asim.',
      timing: 'Monday - Saturday: 6:00 PM - 8:00 PM',
      duration: '6 Months certification',
      features: [
        '17 Classical points of articulation (Makharij)',
        'Sifaat Lazima and Aarida (Characteristics)',
        'Rules of Noon Sakinah, Meem Sakinah, and Madd',
        'Ahkam of Waqf, Ibtida, and Rasm-ul-Khat',
        'Sanad & practical audition exams'
      ],
      tag: 'Recitation Excellence',
    },
  ];

  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest font-bold text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-200">
            Classical Quranic Curriculum
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif-title text-emerald-950 mt-3 mb-4">
            Our Quranic Courses
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Madrassa Arabiyyah Misbah Ul Quran For Huffaz offers four structured programs designed to guide each student from beginner literacy to complete memorization and linguistic mastery.
          </p>
        </div>

        {/* 4 Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              id={`course-card-${course.id}`}
              className="bg-white rounded-2xl border border-emerald-900/15 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:border-emerald-700/40"
            >
              <div>
                {/* Card Top Banner */}
                <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-amber-400/30">
                        {course.tag}
                      </span>
                      <h3 className="text-2xl font-bold font-serif-title mt-2 group-hover:text-amber-200 transition-colors">
                        {course.name}
                      </h3>
                    </div>
                    <span className="font-arabic text-amber-300 text-2xl font-bold">
                      {course.arabicName}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4 text-sm text-slate-700">
                  <p className="text-slate-600 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-100/80 space-y-2">
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-xs text-emerald-950">Suitable For: </span>
                        <span className="text-xs text-slate-600">{course.suitableFor}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-semibold text-xs text-emerald-950">Class Timings: </span>
                        <span className="text-xs text-slate-700 font-medium">{course.timing}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Key Highlights:
                    </h4>
                    <ul className="space-y-1.5">
                      {course.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card Bottom CTA */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => onApplyCourse ? onApplyCourse(course.name) : null}
                  id={`apply-course-btn-${course.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <span>Apply for {course.name}</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

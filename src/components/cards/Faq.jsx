import { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import faqStyles from './Faq.module.scss';

const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  const generatedId = useId();
  const questionId = `${generatedId}-question`;
  const answerId = `${generatedId}-answer`;

  return (
    <div className={faqStyles.faqItem}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={answerId}
        aria-labelledby={questionId}
        onClick={onToggle}
        className={faqStyles.faqButton}
      >
        <span id={questionId} className={faqStyles.question}>
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={faqStyles.iconWrapper}
        >
          <ChevronDown className={faqStyles.chevronIcon} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={answerId}
            role="region"
            aria-labelledby={questionId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={faqStyles.answerWrapper}
          >
            <p className={faqStyles.answerText}>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FAQItem;

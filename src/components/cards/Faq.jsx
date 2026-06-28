import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import faqStyles from './Faq.module.scss';

const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className={faqStyles.faqItem}>
      <button 
        onClick={onToggle} 
        className={faqStyles.faqButton}
      >
        <span className={faqStyles.question}>
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
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={faqStyles.answerWrapper}
          >
            <p className={faqStyles.answerText}>
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FAQItem;
import { motion } from 'framer-motion';
import './PageSection.css';

function PageSection({ title, description, action, children, className = '' }) {
  return (
    <motion.section
      className={`page-section ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
    >
      {(title || action) && (
        <div className="section-header">
          <div className="section-header-content">
            {title && <h2 className="section-title">{title}</h2>}
            {description && <p className="section-description">{description}</p>}
          </div>
          {action && <div className="section-header-action">{action}</div>}
        </div>
      )}
      <div className="section-content">{children}</div>
    </motion.section>
  );
}

export default PageSection;

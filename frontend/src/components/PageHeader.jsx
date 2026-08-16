import { motion } from 'framer-motion';
import './PageHeader.css';

function PageHeader({ title, description, action }) {
  return (
    <motion.div
      className="page-header"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.05 }}
    >
      <div className="page-header-content">
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </motion.div>
  );
}

export default PageHeader;

import React, { ReactNode } from "react";
import styles from "@/styles/privacy-policy.module.css";

interface PolicySectionProps {
  title: string;
  children: ReactNode;
}

const PolicySection: React.FC<PolicySectionProps> = ({ title, children }) => {
  return (
    <section className={styles.policySection}>
      <h2>{title}</h2>
      <div className={styles.sectionContent}>{children}</div>
    </section>
  );
};

export default PolicySection;

import React from "react";
import styles from "@/styles/privacy-policy.module.css";

interface PolicyHeaderProps {
  title: string;
  effectiveDate: string;
}

const PolicyHeader: React.FC<PolicyHeaderProps> = ({
  title,
  effectiveDate,
}) => {
  return (
    <header className={styles.policyHeader}>
      <h1>{title}</h1>
      <p className={styles.effectiveDate}>
        <strong>Effective Date:</strong> {effectiveDate}
      </p>
    </header>
  );
};

export default PolicyHeader;

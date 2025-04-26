import React from "react";
import PolicyHeader from "./policy-header";
import PolicySection from "./policy-section";
import styles from "@/styles/privacy-policy.module.css";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className={styles.policyContainer}>
      <PolicyHeader
        title="Privacy Policy for ColorOne - Canvas Creative"
        effectiveDate="March 13, 2025"
      />

      <PolicySection title="Introduction">
        <p>
          ColorOne - Canvas Creative (&apos;ColorOne,&apos; &apos;we,&apos;
          &apos;our,&apos; or &apos;us&apos;) is committed to protecting your
          privacy and handling your personal information with transparency and
          care. This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you use our macOS application.
        </p>
        <p>
          By downloading, accessing, or using ColorOne - Canvas Creative, you
          agree to the terms outlined in this Privacy Policy. We encourage you
          to read this document carefully to understand our practices regarding
          your personal information.
        </p>
      </PolicySection>

      <PolicySection title="Information We Collect">
        <h3>Information You Provide to Us</h3>
        <p>
          We may collect the following information that you voluntarily provide
          to us:
        </p>
        <ul>
          <li>
            Account information (email address, name, and password) if you
            choose to create an account
          </li>
          <li>User preferences and application settings</li>
          <li>
            Color palettes, collections, and projects you create within the
            application
          </li>
          <li>Feedback, support requests, or communications you send to us</li>
        </ul>

        <h3>Information Collected Automatically</h3>
        <p>
          We may automatically collect certain information when you use our
          application:
        </p>
        <ul>
          <li>Usage data, including how you interact with the application</li>
          <li>
            Device information such as operating system version, hardware model,
            and system performance
          </li>
          <li>
            Diagnostic information in case of application errors or crashes
          </li>
        </ul>

        <h3>Cloud Sync Information</h3>
        <p>If you use our cloud sync feature, we collect and store:</p>
        <ul>
          <li>
            Color palettes, collections, and settings to enable synchronization
            across your devices
          </li>
          <li>Timestamps related to your sync activities</li>
        </ul>
      </PolicySection>

      <PolicySection title="How We Use Your Information">
        <p>We use the information we collect for the following purposes:</p>
        <ul>
          <li>To provide, maintain, and improve ColorOne - Canvas Creative</li>
          <li>
            To enable cloud synchronization of your color palettes and
            application settings
          </li>
          <li>To process and respond to your inquiries and support requests</li>
          <li>
            To analyze usage patterns and optimize application performance
          </li>
          <li>
            To detect, investigate, and prevent fraudulent or unauthorized
            activities
          </li>
          <li>To comply with legal obligations</li>
        </ul>
      </PolicySection>

      <PolicySection title="Information Sharing and Disclosure">
        <p>
          We do not sell, rent, or trade your personal information to third
          parties. We may share your information in the following circumstances:
        </p>
        <ul>
          <li>
            With service providers who assist us in operating our application
            and providing services to you (such as cloud storage providers)
          </li>
          <li>When required by law or to respond to legal process</li>
          <li>
            To protect our rights, privacy, safety, or property, as well as that
            of our users or the public
          </li>
          <li>
            In connection with a business transfer, such as a merger,
            acquisition, or sale of assets
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Data Security">
        <p>
          We implement appropriate technical and organizational measures to
          protect your personal information against unauthorized access,
          alteration, disclosure, or destruction. However, no method of
          transmission over the Internet or electronic storage is 100% secure,
          and we cannot guarantee absolute security.
        </p>
      </PolicySection>

      <PolicySection title="Your Rights and Choices">
        <p>
          Depending on your location, you may have certain rights regarding your
          personal information, including:
        </p>
        <ul>
          <li>Accessing, correcting, or deleting your personal information</li>
          <li>
            Restricting or objecting to our processing of your personal
            information
          </li>
          <li>Data portability</li>
          <li>Withdrawing consent where processing is based on consent</li>
        </ul>
        <p>
          To exercise these rights, please contact us using the information
          provided at the end of this policy.
        </p>
      </PolicySection>

      <PolicySection title="Data Retention">
        <p>
          We retain your personal information for as long as necessary to
          fulfill the purposes outlined in this Privacy Policy, unless a longer
          retention period is required or permitted by law. When determining
          retention periods, we consider the amount, nature, and sensitivity of
          the information, the potential risk of harm from unauthorized use or
          disclosure, and applicable legal requirements.
        </p>
      </PolicySection>

      <PolicySection title="Children's Privacy">
        <p>
          ColorOne - Canvas Creative is not directed to children under the age
          of 13. We do not knowingly collect personal information from children
          under 13. If we discover that a child under 13 has provided us with
          personal information, we will promptly delete such information.
        </p>
      </PolicySection>

      <PolicySection title="Changes to This Privacy Policy">
        <p>
          We may update this Privacy Policy from time to time to reflect changes
          in our practices or for other operational, legal, or regulatory
          reasons. We will notify you of any material changes by posting the
          updated Privacy Policy within the application or by other appropriate
          means. Your continued use of ColorOne - Canvas Creative after such
          modifications will constitute your acknowledgment of the modified
          Privacy Policy.
        </p>
      </PolicySection>

      <PolicySection title="Contact Us">
        <p>
          If you have any questions, concerns, or requests regarding this
          Privacy Policy or our privacy practices, please contact us at:
        </p>
        <p className={styles.contactInfo}>
          <strong>ColorOne Support</strong>
          <br />
          Email: contact@colorone.site
          <br />
          Website: https://colorone.site
        </p>
        <p>
          We will respond to your inquiry in a timely manner and in accordance
          with applicable data protection laws.
        </p>
      </PolicySection>
    </div>
  );
};

export default PrivacyPolicy;

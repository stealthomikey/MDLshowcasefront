import styles from './Welcome.module.css';

const Welcome = () => {
  return (
    <section className={styles.welcomeSection}>
      <h1>Track Your caloire, learn about nutrion!</h1>
      <p>
        Find perfect recipes to help your journey.
      </p>
    </section>
  );
};

export default Welcome;
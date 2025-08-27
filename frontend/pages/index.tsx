import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>OpenKeyHub</h1>
        <h2 className={styles.heroSubtitle}>Decentralized GitHub on ICP</h2>
        <p className={styles.heroDesc}>
          Censorship-resistant, tamper-evident code hosting powered by Internet Computer Protocol. Build in public, verifiably.
        </p>
        <div className={styles.heroActions}>
          <button className={styles.primaryBtn}>Try Demo</button>
          <a href="/learn-more" className={styles.secondaryBtn}>
            Learn more <span className={styles.arrow}>&rarr;</span>
          </a>
        </div>
        <div className={styles.statsRow}>
          <div className={styles.stat}><strong>12K+</strong> Repos</div>
          <div className={styles.stat}><strong>4.8K</strong> Contributors</div>
          <div className={styles.stat}><strong>2.1M</strong> Commits on-chain</div>
        </div>
        <div className={styles.codeBlock}>
          <code>git push origin icp</code>
        </div>
        <div className={styles.heroIconsRow}>
          <div className={styles.heroIcon}>
            <span className={styles.iconCircle}>🛡️</span>
            <span>Integrity</span>
          </div>
          <div className={styles.heroIcon}>
            <span className={styles.iconCircle}>🚫</span>
            <span>Censorship-resistant</span>
          </div>
          <div className={styles.heroIcon}>
            <span className={styles.iconCircle}>🏛️</span>
            <span>DAO-Governed</span>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className={styles.features}>
        <div className={styles.featureItem}>
          <span className={styles.featureIcon}>✅</span>
          <div>
            <h3>On-chain Proofs</h3>
            <p>Every commit notarized on ICP with verifiable integrity.</p>
          </div>
        </div>
        <div className={styles.featureItem}>
          <span className={styles.featureIcon}>⛓️</span>
          <div>
            <h3>Decentralized Storage</h3>
            <p>Assets and metadata distributed—no single point of failure.</p>
          </div>
        </div>
        {/* ...existing code... */}
      </section>

      {/* Trending Section */}
      <section className={styles.trending}>
        <div className={styles.trendingHeader}>
          <h2>Trending on OpenKeyHub</h2>
        </div>
        <ul className={styles.trendingList}>
          <li className={styles.trendingItem}>
            <div>
              <span className={styles.trendingRepoName}>awesome-project</span>
              {/* ...existing code... */}
            </div>
            <div className={styles.trendingActions}>
              <span className={styles.trendingForkIcon} title="Forks">🍴</span>
              <a className={styles.trendingBtn} href="/repo/awesome-project">
                View Repository <span className={styles.arrow}>&rarr;</span>
              </a>
            </div>
          </li>
          {/* ...existing code... */}
        </ul>
        <div className={styles.exploreAllWrapper}>
          <a href="/explore" className={styles.exploreAllBtn}>
            Explore all <span className={styles.arrow}>&rarr;</span>
          </a>
        </div>
      </section>

      {/* Ship Verifiable Software Today */}
      <section className={styles.ctaSection}>
        <h2>Ship Verifiable Software Today</h2>
        <div className={styles.ctaActions}>
          <button className={styles.primaryBtn}>Try Demo</button>
          <a href="/docs" className={styles.secondaryBtn}>
            Docs <span className={styles.arrow}>&rarr;</span>
          </a>
        </div>
      </section>
      {/* ...existing code... */}
    </div>
  );
}
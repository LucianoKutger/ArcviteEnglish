/* eslint-disable no-undef */
/* eslint-disable react/jsx-no-undef */

<FadeOutSection id="biometrics" className={biometricsStyles.biometricsSection}>
          <div className={biometricsStyles.biometricsContainer}>
            <div className={biometricsStyles.biometricsContentWrapper}></div>
            <div className={biometricsStyles.biometricsHeader}>
              <h2 className={biometricsStyles.biometricsTitle}>Precision over Intuition</h2>
              <p className={biometricsStyles.biometricsDescription}>
                Wir verwandeln Rauschen in Strategie. Ihre Daten werden nicht nur gesammelt, sondern in einen operativen Kontext gesetzt.
              </p>
            </div>
            
            <BentoCard 
              title="Biometric Dashboard" 
              subtitle="Echtzeit-Analyse & Zielwert-Projektion." 
              className={biometricsStyles.bentoCardCustom}
            >
              <div className={biometricsStyles.tabsContainer}>
                {dashboardData.map((tab, idx) => (
                  <button 
                    key={tab.id} 
                    onClick={() => setActiveDashTab(idx)} 
                    className={`${biometricsStyles.tabButton} ${activeDashTab === idx ? biometricsStyles.tabButtonActive : biometricsStyles.tabButtonInactive}`}
                  >
                    {tab.icon}{tab.category}
                  </button>
                ))}
              </div>
              
              <div className={biometricsStyles.dashboardPanel}>
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeDashTab} 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -20 }} 
                      transition={{ duration: 0.3 }} 
                      className={biometricsStyles.dashboardGrid}
                    >
                      {dashboardData[activeDashTab].metrics.map((metric, i) => ( 
                        <BiometricSlider key={metric.label} {...metric} delay={i * 0.15} /> 
                      ))}
                    </motion.div>
                  </AnimatePresence>
                  <div 
                    className={biometricsStyles.dashboardOverlay} 
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '100% 40px' }} 
                  />
              </div>
            </BentoCard>
          </div>
</FadeOutSection>
<template>
    <BasePage 
      title="Про нас"
      subtitle="Дізнайтеся про нашу школу та місію"
    >
      <!-- Хто ми -->
      <InfoSection title="Хто ми">
        <p>Ми - провідна IT школа, яка допомагає людям освоїти сучасні технології та знайти своє місце в цифровому світі. Наша місія - зробити якісну IT освіту доступною для кожного.</p>
      </InfoSection>
  
      <!-- Наші досягнення -->
      <InfoSection title="Наші досягнення">
        <div class="achievements-grid">
          <div class="achievement-item">
            <div class="achievement-number">176 000+</div>
            <div class="achievement-text">студентів</div>
          </div>
          <div class="achievement-item">
            <div class="achievement-number">50+</div>
            <div class="achievement-text">курсів</div>
          </div>
          <div class="achievement-item">
            <div class="achievement-number">95%</div>
            <div class="achievement-text">працевлаштування</div>
          </div>
          <div class="achievement-item">
            <div class="achievement-number">10+</div>
            <div class="achievement-text">років досвіду</div>
          </div>
        </div>
      </InfoSection>
  
      <!-- Наші переваги -->
      <InfoSection title="Чому обирають нас">
        <ul>
          <li>✅ Практичний підхід до навчання</li>
          <li>✅ Досвідчені викладачі з реальних проектів</li>
          <li>✅ Гнучкий графік навчання</li>
          <li>✅ Підтримка після закінчення курсу</li>
          <li>✅ Гарантія працевлаштування</li>
          <li>✅ Сучасні технології та інструменти</li>
        </ul>
      </InfoSection>
  
             <!-- Наші курси -->
             <InfoSection title="Наші курси">
         <div class="courses-grid">
           <!-- <div class="course-item">
             <div class="course-icon">��</div>
             <div class="course-name">Front-End Development</div>
             <div class="course-level">Basic & Pro</div>
           </div> -->
           <div class="course-item course-link" @click="navigateToQA">
            <div class="course-icon">🔍</div>
             <div class="course-name">Quality Assurance</div>
             <div class="course-level">Manual & Automation</div>
           </div>
           <div class="course-item course-link" @click="navigateToBA">
            <div class="course-icon">📊</div>
             <div class="course-name">Business Analysis</div>
             <div class="course-level">Basic</div>
           </div>
           <div class="course-item course-link" @click="navigateToBE">
             <div class="course-icon">⚙️</div>
             <div class="course-name">Backend Development</div>
             <div class="course-level">Java, Python, C#</div>
           </div>
           <!-- <div class="course-item">
             <div class="course-icon">��</div>
             <div class="course-name">UI/UX Design</div>
             <div class="course-level">Basic & Pro</div>
           </div> -->
           <!-- <div class="course-item">
             <div class="course-icon">��</div>
             <div class="course-name">Digital Marketing</div>
             <div class="course-level">SMM, SEO, PPC</div>
           </div> -->
         </div>
       </InfoSection>
  
      <!-- Відгуки студентів -->
      <InfoSection title="Відгуки наших студентів">
        <div class="testimonials">
          <div class="testimonial-item">
            <div class="testimonial-text">"Пройшла курс і залишилася дуже задоволена! Особлива подяка викладачу Владиславу — пояснював чітко, доступно й по суті, з прикладами й детальними роз'ясненнями."</div>
            <div class="testimonial-author">— Тетяна Гузєва</div>
            <div class="testimonial-course">Front-End Basic</div>
          </div>
          <div class="testimonial-item">
            <div class="testimonial-text">"Я дуже дякую за навчання! Було не завжди легко, але завжди дуже цікаво! Приємна атмосфера, відчувала підтримку."</div>
            <div class="testimonial-author">— Олена Дегтярьова</div>
            <div class="testimonial-course">Графічний дизайн</div>
          </div>
          <div class="testimonial-item">
            <div class="testimonial-text">"Хочу поділитися враженням від навчання з Олексієм Дворніком. Як викладач, Олексій справив на мене дуже позитивне враження: чітка, грамотна мова, послідовне та логічне викладення матеріалу."</div>
            <div class="testimonial-author">— Роман Кулік</div>
            <div class="testimonial-course">Social Media Marketing</div>
          </div>
        </div>
      </InfoSection>
  
      <!-- Наша місія -->
      <InfoSection title="Наша місія">
        <p>Наша місія - створити найкращу IT школу, де кожен студент може реалізувати свій потенціал та стати успішним IT спеціалістом. Ми віримо, що якісна освіта - це ключ до успішного майбутнього.</p>
      </InfoSection>
  
      <!-- Контакти -->
      <InfoSection title="Зв'яжіться з нами">
      <div class="contact-info">
        <div class="contact-item">
          <span class="contact-icon">��</span>
          <a href="tel:+380731002341" class="contact-text contact-link">+38 073 100 23 41</a>
        </div>
        <div class="contact-item">
          <span class="contact-icon">✉️</span>
          <a href="mailto:skillKlan@gmail.com" class="contact-text contact-link">skillKlan@gmail.com</a>
        </div>
        <!-- <div class="contact-item">
          <span class="contact-icon">��</span>
          <a href="https://ithillel.ua" target="_blank" rel="noopener noreferrer" class="contact-text contact-link">ithillel.ua</a>
        </div> -->
      </div>
    </InfoSection>
    </BasePage>
  </template>
  
  <script setup lang="ts">
import BasePage from '../components/BasePage.vue'
import InfoSection from '../components/InfoSection.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToQA = () => {
  router.push('/qa')
}

const navigateToBA = () => {
  router.push('/ba')
}

const navigateToBE = () => {
  router.push('/be')
}
</script>
  
  <style scoped>
  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
    margin: 20px 0;
  }
  
  .achievement-item {
    text-align: center;
    padding: 20px;
    background: rgba(75, 85, 99, 0.3);
    border-radius: 12px;
    border: 1px solid rgba(139, 92, 246, 0.3);
  }
  
  .achievement-number {
    font-size: clamp(24px, 6vw, 32px);
    font-weight: 700;
    color: #8b5cf6;
    margin-bottom: 8px;
  }
  
  .achievement-text {
    font-size: clamp(14px, 3.5vw, 16px);
    color: #e5e7eb;
    line-height: 1.4;
  }
  
  .courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin: 20px 0;
  }
  
  .course-item {
    padding: 16px;
    background: rgba(75, 85, 99, 0.3);
    border-radius: 8px;
    border: 1px solid rgba(139, 92, 246, 0.2);
    text-align: center;
    transition: all 0.2s ease;
  }
  
  .course-item:hover {
    border-color: #8b5cf6;
    background: rgba(75, 85, 99, 0.5);
  }
  
  .course-icon {
    font-size: 24px;
    margin-bottom: 8px;
  }
  
  .course-name {
    font-size: clamp(14px, 3.5vw, 16px);
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 4px;
  }
  
  .course-level {
    font-size: clamp(12px, 3vw, 14px);
    color: #8b5cf6;
    font-weight: 500;
  }
  
  .testimonials {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin: 20px 0;
  }
  
  .testimonial-item {
    padding: 20px;
    background: rgba(75, 85, 99, 0.3);
    border-radius: 12px;
    border-left: 4px solid #8b5cf6;
  }
  
  .testimonial-text {
    font-size: clamp(14px, 3.5vw, 16px);
    color: #e5e7eb;
    line-height: 1.6;
    margin-bottom: 12px;
    font-style: italic;
  }
  
  .testimonial-author {
    font-size: clamp(14px, 3.5vw, 16px);
    font-weight: 600;
    color: #8b5cf6;
    margin-bottom: 4px;
  }
  
  .testimonial-course {
    font-size: clamp(12px, 3vw, 14px);
    color: #9ca3af;
  }
  
  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 20px 0;
  }
  
  .contact-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(75, 85, 99, 0.3);
    border-radius: 8px;
  }
  
  .contact-icon {
    font-size: 20px;
  }
  
  .contact-text {
    font-size: clamp(14px, 3.5vw, 16px);
    color: #e5e7eb;
  }

  .contact-link {
  text-decoration: none;
  color: #e5e7eb;
  transition: color 0.2s ease;
}

.contact-link:hover {
  color: #8b5cf6;
}

.contact-link:active {
  color: #7c3aed;
}
  
  /* Адаптивні стилі */
  @media (max-width: 768px) {
    .achievements-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    
    .courses-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }
  
  @media (max-width: 480px) {
    .achievements-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    
    .achievement-item,
    .course-item,
    .testimonial-item {
      padding: 16px;
    }
  }
  </style>
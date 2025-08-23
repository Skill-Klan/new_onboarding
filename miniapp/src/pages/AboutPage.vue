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

    <!-- Кнопка переходу на FAQ -->
    <div class="faq-section">
        <button class="faq-button" @click="navigateToFAQ">
          <span class="button-icon">❓ </span>
          <span class="button-text">  Часто запитують</span>
        </button>
      </div>
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

const navigateToFAQ = () => {
  router.push('/faq')
}
</script>
  
  <style scoped>
  /* Стилі винесені в src/pages/styles/about-page.css */
  /* Залишаємо тільки специфічні стилі, які не входять в спільні */
  
  /* Кнопка FAQ (специфічна для цієї сторінки) */
  .faq-section {
    text-align: center;
    margin: 30px 0;
  }
  
  .faq-button {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
    margin: 0 auto;
    justify-content: center;
  }
  
  .faq-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  }
  
  .faq-button:active {
    transform: translateY(0);
  }
  
  .button-icon {
    font-size: 20px;
  }
  
  .button-text {
    font-weight: 600;
  }
  
  /* Адаптивність для кнопки FAQ */
  @media (max-width: 768px) {
    .faq-button {
      padding: 14px 20px;
      font-size: 15px;
    }
    
    .button-icon {
      font-size: 18px;
    }
  }
  
  @media (max-width: 480px) {
    .faq-button {
      padding: 12px 16px;
      font-size: 14px;
    }
    
    .button-icon {
      font-size: 16px;
    }
  }
</style>
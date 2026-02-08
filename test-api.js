// Тестирование API Quest Messenger
const API_URL = 'http://localhost:3000';

async function testAnalyze() {
  console.log('=== ТЕСТ 1: Вежливое сообщение ===');

  const request1 = {
    characterName: 'anna',
    playerMessage: 'Здравствуйте, Анна. Понимаю, вам сейчас очень тяжело. Могу я чем-то помочь?',
    currentTrust: 50,
    currentEmotion: 'neutral',
    revealedSecrets: []
  };

  try {
    const response1 = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request1)
    });

    const data1 = await response1.json();
    console.log('✅ Результат:', JSON.stringify(data1, null, 2));
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }

  console.log('\n=== ТЕСТ 2: Грубое обвинение ===');

  const request2 = {
    characterName: 'anna',
    playerMessage: 'Ты убила директора! Признавайся немедленно!',
    currentTrust: 50,
    currentEmotion: 'neutral',
    revealedSecrets: []
  };

  try {
    const response2 = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request2)
    });

    const data2 = await response2.json();
    console.log('✅ Результат:', JSON.stringify(data2, null, 2));
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }

  console.log('\n=== ТЕСТ 3: Упоминание дочери Бориса (вежливо) ===');

  const request3 = {
    characterName: 'boris',
    playerMessage: 'Я знаю про вашу дочь Катю. Громов спас её жизнь.',
    currentTrust: 30,
    currentEmotion: 'neutral',
    revealedSecrets: []
  };

  try {
    const response3 = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request3)
    });

    const data3 = await response3.json();
    console.log('✅ Результат:', JSON.stringify(data3, null, 2));
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

// Запуск теста
testAnalyze().then(() => {
  console.log('\n✅ Все тесты завершены');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Фатальная ошибка:', err);
  process.exit(1);
});

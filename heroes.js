//! Герой конструктор
class Hero {
  constructor(name, hp, dmg, energyCost, ability, rarity) {
    this.name = name;
    this.hp = hp;
    this.maxHp = hp;
    this.dmg = dmg;
    this.energyCost = energyCost;
    this.ability = ability;
    this.rarity = rarity;
    this.originalDmg = dmg;
    this.abilityUsedThisTurn = false;
    this.temporaryEffects = []; // Для временных эффектов
  }

  // Добавление временного эффекта
  addEffect(effect, duration) {
    this.temporaryEffects.push({ effect, duration });
    effect.apply(this);
  }

  // Обновление эффектов в конце хода
  updateEffects() {
    this.temporaryEffects = this.temporaryEffects.filter((e) => {
      e.duration--;
      if (e.duration <= 0) {
        e.effect.remove(this);
        return false;
      }
      return true;
    });
  }
}

const effects = {
  damageBoost: {
    amount: 0,
    create(amount) {
      return {
        apply: (hero) => {
          hero.dmg += amount;
          console.log(`${hero.name} получает +${amount} к урону`);
        },
        remove: (hero) => {
          hero.dmg -= amount;
          console.log(`${hero.name} теряет +${amount} к урону`);
        },
      };
    },
  },
  damageReduction: {
    amount: 0,
    create(amount) {
      return {
        apply: (hero) => {
          hero.damageReduction = (hero.damageReduction || 0) + amount;
          console.log(`${hero.name} получает блок ${amount} урона`);
        },
        remove: (hero) => {
          hero.damageReduction = (hero.damageReduction || 0) - amount;
          console.log(`${hero.name} теряет блок ${amount} урона`);
        },
      };
    },
  },
  stun: {
    create() {
      return {
        apply: (hero) => {
          hero.isStunned = true;
          console.log(`${hero.name} оглушен и пропускает ход`);
        },
        remove: (hero) => {
          hero.isStunned = false;
          console.log(`${hero.name} больше не оглушен`);
        },
      };
    },
  },
  dodge: {
    create() {
      return {
        apply: (hero) => {
          hero.canDodge = true;
          console.log(`${hero.name} может уклониться от следующей атаки`);
        },
        remove: (hero) => {
          hero.canDodge = false;
          console.log(`${hero.name} больше не может уклоняться`);
        },
      };
    },
  },
  regeneration: {
    amount: 0,
    create(amount) {
      return {
        apply: (hero) => {
          hero.regeneration = amount;
          console.log(`${hero.name} регенерирует ${amount} HP каждый ход`);
        },
        remove: (hero) => {
          hero.regeneration = 0;
          console.log(`${hero.name} больше не регенерирует HP`);
        },
      };
    },
  },
};

//! Список героев с обновленными способностями
const HEROES = [
  new Hero("Iron Man", 6, 5, 4, "Repulsor Blast: +2 урона на 1 ход", "epic"),
  new Hero("Thor", 6, 6, 6, "Lightning Strike: Удар по 2 врагам", "epic"),
  new Hero(
    "Black Panther",
    6,
    5,
    4,
    "Vibranium Armor: Блок 2 урона на 1 ход",
    "epic"
  ),
  new Hero("D. Strange", 7, 4, 5, "Time Loop: Лечит +3 HP", "epic"),
  new Hero("Vision", 6, 5, 4, "Phase: Уклонение от атаки на 1 ход", "epic"),
  new Hero("Wolverine", 5, 6, 4, "Regeneration: +2 HP/ход на 1 ход", "epic"),
  new Hero("C. America", 6, 5, 3, "Shield Block: -50% урона на 1 ход", "rare"),
  new Hero("Spider-Man", 5, 5, 3, "Web Shot: Оглушение на 1 ход", "rare"),
  new Hero(
    "Black Widow",
    5,
    4,
    2,
    "Stealth: Уклонение от атаки на 1 ход",
    "rare"
  ),
  new Hero("Hulk", 8, 6, 5, "Rage: +3 урона при HP < 50%", "mythic"),
  new Hero("Scarlet Witch", 6, 7, 6, "Chaos Magic: Случайный эффект", "mythic"),
  new Hero("Ant-Man", 4, 3, 1, "Shrink: -2 урона врагу на 1 ход", "common"),
  new Hero("Hawkeye", 4, 4, 2, "Precise Shot: Игнорирует защиту", "common"),
  new Hero(
    "Falcon",
    5,
    3,
    2,
    "Aerial Strike: +1 урон за каждого живого союзника",
    "common"
  ),
];

//! Картинки героев
const HERO_IMAGES = {
  "Iron Man": "./image/iron_man.jpg",
  Thor: "./image/thor.jpg",
  "Black Panther": "./image/black_panther.jpg",
  "D. Strange": "./image/doctor_strange.jpg",
  Vision: "./image/vision.jpg",
  Wolverine: "./image/wolverine.jpg",
  "C. America": "./image/captain_america.jpg",
  "Spider-Man": "./image/spider_man.jpg",
  "Black Widow": "./image/black_widow.jpg",
  Hulk: "./image/hulk.jpg",
  "Scarlet Witch": "./image/scarlet_witch.jpg",
  "Ant-Man": "./image/ant_man.jpg",
  Hawkeye: "./image/hawkeye.jpg",
  Falcon: "./image/falcon.jpg",
};

//! Переменные
const DECK_OF_CARDS = 6;
let ENEMY_HEROES = [];
let ENEMY_MANA = 10;
let YOUR_HEROES = [];
let YOUR_MANA = 10;
let CURRENT_TURN = "player";
let TURN_LOCK = false;
let SELECTED_HERO = null;
let TRACER = null;

//! Вспомогательные функции
const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

const renderMana = (container, mana) => {
  container.innerHTML = "";
  for (let i = 1; i <= 20; i++) {
    const dot = document.createElement("div");
    dot.className = "mana_dot" + (i <= mana ? " active" : "");
    container.appendChild(dot);
  }
};

const clearSelection = () => {
  SELECTED_HERO = null;
  document
    .querySelectorAll(".card")
    .forEach((card) => card.classList.remove("selected"));
  document
    .querySelectorAll("#enemy_deck .card")
    .forEach((card) => card.classList.remove("target-hover"));
  if (TRACER) {
    document.body.removeChild(TRACER);
    TRACER = null;
  }
};

//! Обновление маны
const updateMana = () => {
  renderMana(document.getElementById("your_mana"), YOUR_MANA);
  renderMana(document.getElementById("enemy_mana"), ENEMY_MANA);
};

//! Обновление очередности хода
const updateTurnDisplay = () => {
  document.getElementById("turn_display").textContent =
    CURRENT_TURN === "player" ? "Ваш ход" : "Ход врага";
};

//! Раздача карт
const dealCards = () => {
  const shuffled = shuffle(HEROES);
  YOUR_HEROES.push(...shuffled.slice(0, DECK_OF_CARDS));
  ENEMY_HEROES.push(...shuffled.slice(DECK_OF_CARDS, DECK_OF_CARDS * 2));

  YOUR_HEROES.forEach((hero) => (hero.maxHp = hero.hp));
  ENEMY_HEROES.forEach((hero) => (hero.maxHp = hero.hp));
};

//! Функция для использования способностей (ПКМ)
const useHeroAbility = (hero, isPlayer = true) => {
  if (hero.abilityUsedThisTurn) {
    console.log(`${hero.name}: способность уже использована в этом ходу!`);
    return false;
  }

  const mana = isPlayer ? YOUR_MANA : ENEMY_MANA;
  if (mana < hero.energyCost) {
    console.log(
      `${hero.name}: недостаточно энергии для использования способности!`
    );
    return false;
  }

  let abilityUsed = false;
  const targets = isPlayer ? ENEMY_HEROES : YOUR_HEROES;
  const allies = isPlayer ? YOUR_HEROES : ENEMY_HEROES;

  switch (hero.name) {
    case "Hulk":
      if (hero.hp < hero.maxHp / 2) {
        hero.addEffect(effects.damageBoost.create(3), 1);
        abilityUsed = true;
        console.log(`${hero.name} в ярости! Урон увеличен на 3.`);
      } else {
        console.log(
          `${hero.name}: способность 'Ярость' активируется только при HP < 50%`
        );
      }
      break;

    case "Thor":
      if (targets.length >= 2) {
        const selectedTargets = shuffle([...targets]).slice(0, 2);
        selectedTargets.forEach((target) => {
          target.hp -= hero.dmg;
          console.log(
            `${hero.name} ударяет молнией ${target.name} на ${hero.dmg} урона`
          );
          if (target.hp <= 0) {
            const index = targets.indexOf(target);
            targets.splice(index, 1);
            console.log(`${target.name} повержен!`);
          }
        });
        abilityUsed = true;
      } else {
        console.log(`${hero.name}: недостаточно целей для способности!`);
      }
      break;

    case "Iron Man":
      hero.addEffect(effects.damageBoost.create(2), 1);
      abilityUsed = true;
      console.log(
        `${hero.name} использует репульсорный удар! +2 урона на следующий ход.`
      );
      break;

    case "Black Panther":
      hero.addEffect(effects.damageReduction.create(2), 1);
      abilityUsed = true;
      console.log(
        `${hero.name} активирует вибраниумную броню! Блокирует 2 урона.`
      );
      break;

    case "D. Strange":
      const healAmount = 3;
      hero.hp = Math.min(hero.hp + healAmount, hero.maxHp);
      abilityUsed = true;
      console.log(
        `${hero.name} использует петлю времени! Восстановлено ${healAmount} HP.`
      );
      break;

    case "Vision":
    case "Black Widow":
    case "Spider-Man":
    case "C. America":
    case "Wolverine":
    case "Ant-Man":
    case "Scarlet Witch":
    case "Hawkeye":
    case "Falcon":
      abilityUsed = useSpecialAbility(hero, isPlayer, targets, allies);
      break;

    default:
      console.log(`${hero.name}: этот герой пока не имеет способности`);
  }

  if (abilityUsed) {
    hero.abilityUsedThisTurn = true;
    if (isPlayer) {
      YOUR_MANA -= hero.energyCost;
    } else {
      ENEMY_MANA -= hero.energyCost;
    }
    return true;
  }
  return false;
};

const useSpecialAbility = (hero, isPlayer, targets, allies) => {
  switch (hero.name) {
    case "Vision":
      hero.addEffect(effects.dodge.create(), 1);
      console.log(
        `${hero.name} использует фазовый сдвиг! Уклонение от следующей атаки.`
      );
      return true;

    case "Black Widow":
      hero.addEffect(effects.dodge.create(), 1);
      console.log(
        `${hero.name} активирует стелс! Уклонение от следующей атаки.`
      );
      return true;

    case "Spider-Man":
      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        target.addEffect(effects.stun.create(), 1);
        console.log(`${hero.name} оглушает ${target.name} на 1 ход!`);
        return true;
      }
      return false;

    case "C. America":
      hero.addEffect(
        {
          apply: (h) => {
            h.damageReductionPercent = 50;
          },
          remove: (h) => {
            h.damageReductionPercent = 0;
          },
        },
        1
      );
      console.log(
        `${hero.name} поднимает щит! Уменьшает получаемый урон на 50%.`
      );
      return true;

    case "Wolverine":
      hero.addEffect(effects.regeneration.create(2), 1);
      console.log(`${hero.name} активирует регенерацию! +2 HP в конце хода.`);
      return true;

    case "Ant-Man":
      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        target.addEffect(effects.damageBoost.create(-2), 1);
        console.log(`${hero.name} уменьшает ${target.name}! Урон снижен на 2.`);
        return true;
      }
      return false;

    case "Scarlet Witch":
      const randomEffect = Math.floor(Math.random() * 5);
      switch (randomEffect) {
        case 0: // Лечение
          hero.hp = Math.min(hero.hp + 4, hero.maxHp);
          console.log(`${hero.name}: хаотическая магия восстановила 4 HP!`);
          break;
        case 1: // Увеличение урона
          hero.addEffect(effects.damageBoost.create(2), 1);
          console.log(`${hero.name}: хаотическая магия увеличила урон на 2!`);
          break;
        case 2: // Оглушение
          if (targets.length > 0) {
            const target = targets[Math.floor(Math.random() * targets.length)];
            target.addEffect(effects.stun.create(), 1);
            console.log(
              `${hero.name}: хаотическая магия оглушила ${target.name}!`
            );
          }
          break;
        case 3: // Уменьшение урона
          if (targets.length > 0) {
            const target = targets[Math.floor(Math.random() * targets.length)];
            target.addEffect(effects.damageBoost.create(-2), 1);
            console.log(
              `${hero.name}: хаотическая магия уменьшила урон ${target.name} на 2!`
            );
          }
          break;
        case 4: // Обратный эффект
          hero.hp -= 2;
          console.log(`${hero.name}: хаотическая магия нанесла 2 урона!`);
          break;
      }
      return true;

    case "Hawkeye":
      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        const damage = hero.dmg + (target.damageReduction || 0);
        target.hp -= damage;
        console.log(
          `${hero.name} делает точный выстрел в ${target.name} на ${damage} урона (игнорирует защиту)!`
        );
        if (target.hp <= 0) {
          const index = targets.indexOf(target);
          targets.splice(index, 1);
          console.log(`${target.name} повержен!`);
        }
        return true;
      }
      return false;

    case "Falcon":
      const bonusDamage = allies.filter((a) => a !== hero).length;
      hero.addEffect(effects.damageBoost.create(bonusDamage), 1);
      console.log(
        `${hero.name} вызывает воздушную поддержку! +${bonusDamage} урона за каждого союзника.`
      );
      return true;

    default:
      return false;
  }
};

//! Сброс состояний героев после хода
const resetHeroStates = () => {
  [YOUR_HEROES, ENEMY_HEROES].forEach((team) => {
    team.forEach((hero) => {
      hero.updateEffects();

      hero.abilityUsedThisTurn = false;

      if (hero.regeneration) {
        hero.hp = Math.min(hero.hp + hero.regeneration, hero.maxHp);
        console.log(`${hero.name} регенерирует ${hero.regeneration} HP.`);
      }

      if (hero.isStunned) {
        console.log(`${hero.name} пропускает ход из-за оглушения.`);
        hero.isStunned = false;
      }
    });
  });
};

//! Создание карты героя
const createCard = (hero, isClickable = true, isEnemy = false) => {
  const cardDiv = document.createElement("div");
  cardDiv.className = `card ${hero.rarity}` + (isEnemy ? " enemy_card" : "");
  cardDiv.style.backgroundImage = `url('${HERO_IMAGES[hero.name]}')`;
  cardDiv.innerHTML = `
    <div class="energy_cost">
      ${Array(hero.energyCost).fill('<div class="energy_dot"></div>').join("")}
    </div>
    <h3 class="hero_name">${hero.name}</h3>
    <div class="hero_hp"><p>${hero.hp}</p></div>
    <div class="hero_dmg"><p>${hero.dmg}</p></div>
    <div class="ability_tooltip">${hero.ability}</div>
  `;

  if (isClickable) {
    cardDiv.addEventListener("mousedown", (event) =>
      handleCardClick(hero, event, cardDiv)
    );

    if (!isEnemy) {
      cardDiv.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        if (CURRENT_TURN !== "player" || TURN_LOCK) return;
        useHeroAbility(hero, true);
      });
    }
  }

  return cardDiv;
};

//! Создание и обновление позиции трейсера
const createTracer = () => {
  if (TRACER) document.body.removeChild(TRACER);
  TRACER = document.createElement("div");
  TRACER.className = "tracer";
  document.body.appendChild(TRACER);
  return TRACER;
};

const updateTracerPosition = (startX, startY, endX, endY) => {
  if (!TRACER) return;
  const length = Math.hypot(endX - startX, endY - startY);
  const angle = (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI;
  Object.assign(TRACER.style, {
    width: `${length}px`,
    left: `${startX}px`,
    top: `${startY}px`,
    transform: `rotate(${angle}deg)`,
    transformOrigin: "0 0",
  });
};

//! Обработка клика по карте героя
const handleCardClick = (hero, event, cardDiv) => {
  if (CURRENT_TURN !== "player" || TURN_LOCK) return;
  clearSelection();
  cardDiv.classList.add("selected");
  SELECTED_HERO = hero;

  const tracer = createTracer();
  const { left, top, width, height } = cardDiv.getBoundingClientRect();
  const startX = left + width / 2;
  const startY = top + height / 2;

  document.querySelectorAll("#enemy_deck .card").forEach((enemyCard, index) => {
    enemyCard.addEventListener(
      "mouseenter",
      () => SELECTED_HERO && enemyCard.classList.add("target-hover")
    );
    enemyCard.addEventListener("mouseleave", () =>
      enemyCard.classList.remove("target-hover")
    );
    enemyCard.addEventListener("click", () => {
      if (!SELECTED_HERO) return;
      const targetHero = ENEMY_HEROES[index];
      targetHero.hp -= SELECTED_HERO.dmg;
      if (targetHero.hp <= 0) ENEMY_HEROES.splice(index, 1);

      resetHeroStates();
      clearSelection();
      updateGameState();
      startEnemyTurn();
    });
  });

  document.addEventListener("mousemove", function mouseMoveHandler(moveEvent) {
    if (SELECTED_HERO) {
      updateTracerPosition(
        startX,
        startY,
        moveEvent.clientX,
        moveEvent.clientY
      );
    } else {
      document.removeEventListener("mousemove", mouseMoveHandler);
    }
  });
};

//! Отрисовка карт
const showCards = () => {
  const yourDeckDiv = document.getElementById("your_deck");
  const enemyDeckDiv = document.getElementById("enemy_deck");
  yourDeckDiv.innerHTML = "";
  enemyDeckDiv.innerHTML = "";
  YOUR_HEROES.forEach((hero) => yourDeckDiv.appendChild(createCard(hero)));
  ENEMY_HEROES.forEach((hero) =>
    enemyDeckDiv.appendChild(createCard(hero, false, true))
  );
};

//! Общее обновление состояния игры
const updateGameState = () => {
  showCards();
  updateMana();
  updateTurnDisplay();

  if (YOUR_HEROES.length === 0) {
    console.log("Вы проиграли!");
    TURN_LOCK = true;
  } else if (ENEMY_HEROES.length === 0) {
    console.log("Вы победили!");
    TURN_LOCK = true;
  }
};

//! Ход врага (ИИ)
const startEnemyTurn = () => {
  CURRENT_TURN = "enemy";
  TURN_LOCK = true;
  updateTurnDisplay();

  setTimeout(() => {
    if (!ENEMY_HEROES.length || !YOUR_HEROES.length) return;

    // ИИ выбирает действие
    const possibleActions = [];

    // 1. Проверяем возможность использовать способности
    ENEMY_HEROES.forEach((hero) => {
      if (!hero.abilityUsedThisTurn && ENEMY_MANA >= hero.energyCost) {
        possibleActions.push({ type: "ability", hero });
      }
    });

    // 2. Добавляем обычные атаки
    ENEMY_HEROES.forEach((attacker) => {
      YOUR_HEROES.forEach((target) => {
        possibleActions.push({ type: "attack", attacker, target });
      });
    });

    // Выбираем случайное действие с приоритетом на способности
    if (possibleActions.length > 0) {
      const abilityActions = possibleActions.filter(
        (a) => a.type === "ability"
      );
      const chosenAction =
        abilityActions.length > 0 && Math.random() > 0.3
          ? abilityActions[Math.floor(Math.random() * abilityActions.length)]
          : possibleActions[Math.floor(Math.random() * possibleActions.length)];

      if (chosenAction.type === "ability") {
        console.log(
          `ИИ использует способность ${chosenAction.hero.name}: ${chosenAction.hero.ability}`
        );
        useHeroAbility(chosenAction.hero, false);
      } else {
        // Проверяем уклонение
        if (chosenAction.target.canDodge) {
          console.log(
            `${chosenAction.target.name} уклонился от атаки ${chosenAction.attacker.name}!`
          );
          chosenAction.target.canDodge = false;
        } else {
          // Применяем защиту
          const damageReduction = chosenAction.target.damageReduction || 0;
          let damage = Math.max(0, chosenAction.attacker.dmg - damageReduction);

          // Учитываем процентную защиту
          if (chosenAction.target.damageReductionPercent) {
            damage = Math.floor(
              damage * (1 - chosenAction.target.damageReductionPercent / 100)
            );
          }

          chosenAction.target.hp -= damage;
          console.log(
            `${chosenAction.attacker.name} атакует ${chosenAction.target.name} и наносит ${damage} урона!`
          );

          if (chosenAction.target.hp <= 0) {
            const index = YOUR_HEROES.indexOf(chosenAction.target);
            YOUR_HEROES.splice(index, 1);
            console.log(`${chosenAction.target.name} повержен!`);
          }
        }
      }
    }

    // Восстанавливаем ману и переключаем ход
    YOUR_MANA = Math.min(YOUR_MANA + 1, 20);
    ENEMY_MANA = Math.min(ENEMY_MANA + 1, 20);
    resetHeroStates();
    CURRENT_TURN = "player";
    TURN_LOCK = false;
    updateGameState();
  }, 1000);
};

//! Модальное окно 
  const openBtn = document.getElementById('open_modal');
  const closeBtn = document.getElementById('close_modal');
  const overlay = document.getElementById('modal_overlay');

  openBtn.addEventListener('click', () => {
    overlay.style.display = 'flex';
  });

  closeBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.style.display = 'none';
    }
  });

document.addEventListener("DOMContentLoaded", () => {
  dealCards();
  updateGameState();

  document.getElementById("end_turn").addEventListener("click", () => {
    if (CURRENT_TURN !== "player" || TURN_LOCK) return;

    YOUR_MANA = Math.min(YOUR_MANA + 1, 20);
    ENEMY_MANA = Math.min(ENEMY_MANA + 1, 20);
    resetHeroStates();
    startEnemyTurn();
  });
});

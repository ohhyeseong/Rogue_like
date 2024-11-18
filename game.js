import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
  constructor() {
    this.hp = 50;
    this.attackPower = 30;
  }

  attack(monster) {
    // 플레이어의 공격
    const damage = this.attackPower;
    // 몬스터의 hp를 깍는다.
    monster.takeDameage(this.attackPower);
    return damage;
  }
  healstage() {
    // 중간에 쉬어가는 스테이지
    let heal = Math.floor(Math.random() * 51) + 100; // 100 ~ 150 랜덤으로 회복증가
    this.hp += heal;
  }

  levelUp() {
    let hprandom = Math.floor(Math.random() * 21) + 30; // 10 ~ 20 + 10 랜덤 증가.
    let Powerrandom = Math.floor(Math.random() * 10); // 0 ~ 10 랜덤 증가.
    this.hp += hprandom; // 스테이지 클리어시 체력이 증가하는 시스템
    this.attackPower += Powerrandom; // 위와 동일하게 공격력이 증가하는 시스템
    console.log(
      chalk.green(
        `스테이지 클리어! 체력이 ${this.hp}로 증가하고 공격력이 ${this.attackPower}로 증가했습니다!`,
      ),
    );
  }
  // 플레이어의 피를 0 미만으로 떨구지 않기
  takeDameage(amont) {
    this.hp = Math.max(this.hp - amont, 0);
  }
}

class Monster {
  constructor(stage) {
    this.hp = 20 + Math.floor(Math.random() + (stage - 1) * 10) + 10; // 스테이지마다 랜덤으로 0 ~ 4 + 15 씩 추가
    this.attackPower = 10 + Math.floor(Math.random() + (stage - 1) * 5) + 2; // 위와 동일하게 랜덤으로 0 ~ 4 + 2 씩 추가
  }

  attack(player) {
    // 몬스터의 공격
    // 플레이어의 hp를 깍는다.
    player.hp -= this.attackPower;
  }

  // 몬스터의 hp가 0 이하로 떨어지지 않도록
  // amount : 알아보기 쉽게 지은 이름
  takeDameage(amount) {
    this.hp = Math.max(this.hp - amount, 0);
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
      chalk.blueBright(
        `| 플레이어 HP : ${player.hp} POWER : ${player.attackPower} |`,
      ) +
      chalk.redBright(`| 몬스터 HP : ${monster.hp} POWER : ${monster.attackPower} |`),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];

  while (true) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    // 배틀종료
    //  - 몬스터를 처치 시.
    //  - 플레이어가 사망 시.
    if (monster.hp <= 0) {
      // 몬스터를 잡으면 입력키를 눌러 다음 스테이지로 올라가기
      readlineSync.question('다음 스테이지로 가기위해 엔터를 눌러주세요!');
      player.levelUp(); // 스테이지 클리어시 레벨업
      readlineSync.question('계속할려면 엔터 렛츠고');
      return;
    }

    // 플레이어 체력이 다 떨어지면 게임오버 만들기.
    if (player.hp <= 0) {
      player.hp = 0; // 플레이어의 체력을 0으로 고정
      console.log(
        chalk.red(`당신의 몸은 더이상 싸울 수 있는 몸이 아닙니다...
        게임 오버!`),
      );
      return 'gameOver';
    }
    const choices = {
      1: '공격한다',
      2: '회피공격하기',
      3: '도망간다'
  };
    console.log(chalk.green(`\n1. 공격한다 2. 회피공격하기(40%) 3. 도망간다(20%)`));
    const choice = readlineSync.question('당신의 선택은? ');
    logs.push(chalk.green(`${choices[choice]}를 선택하셨습니다.`));
    // choice 1이면
    if (choice === '1') {
      // 플레이어가 몬스터를 공격한다.
      const damage = player.attack(monster);
      logs.push(chalk.green(`플레이어가 몬스터에게 ${damage}를 입혔습니다!`));
      // 몬스터가 플레이어를 공격한다.
      // 몬스터가 죽었는지 체크
      // 안죽었으면 공격

      if (monster.hp > 0) {
        monster.attack(player);
        logs.push(chalk.red.bold(`하지만 곧바로 몬스터가 플레이어를 공격했습니다!`));
      } else {
        logs.push(chalk.green(`몬스터를 처치했습니다!!`));
      }
      if (player.hp < 0) {
        player.hp = 0; // 체력이 0 이하로 떨어지지 않도록 고정
      }
    } else if (choice === '2') {
      // 회피 공격하는 선택지.
      logs.push(chalk.yellow(`당신은 회피 공격을 실행했습니다!`));
      if (Math.random() < 0.4) {
        // 40% 확률
        const bonusDamage = Math.floor(player.attackPower * 1.5); // 50% 강한 데미지
        monster.takeDameage(bonusDamage);
        logs.push(
          chalk.green(`회피 성공! 회피한 다음 몬스터에게 ${bonusDamage}의 대미지를 입혔습니다!`),
        );
      } else {
        // flase 면 회피에 실패하여 몬스터에 공격을 허용해준다.
        logs.push(chalk.gray.bold(`회피에 실패하셨습니다!`));
        monster.attack(player);
        logs.push(chalk.red.bold(`몬스터가 플레이어를 공격했습니다!`));
        if (player.hp < 0) {
          player.hp = 0; // 체력이 0 이하로 떨어지지 않도록 고정
        }
      }
    } else if (choice === '3') {
      // 도망치기 선택지.
      // 다음 스테이지로 이동
      //  랜덤   도망가기 20% 확률
      if (Math.random() < 0.2) {
      logs.push(chalk.yellow(`당신은 도망을 실행했습니다!`));
      console.log(chalk.yellow(`플레이어가 무사히 도망쳤습니다!`)); // 도망쳤다는 메시지 추가
      readlineSync.question('계속할려면 엔터 렛츠고'); // 계속할건지 확인
      return; // 도망쳤으니 루프를 끝낸다.
    } else {
      logs.push(chalk.yellow(`당신은 도망을 실행했습니다!`));
      logs.push(chalk.green(`플레이어가 도망에 실패했습니다!`)); // 도망에 실패 했는다는 메시지
      monster.attack(player); // 턴을 소비했으니 몬스터의 공격
      logs.push(chalk.red.bold(`몬스터가 플레이어를 공격했습니다!`));
      if (player.hp < 0) {
        player.hp = 0; // 체력이 0 이하로 떨어지지 않도록 고정
      }
    }
    }else {
      console.log("올바른 선택을 하십시오.");
    }
    // 플레이어의 선택에 따라 다음 행동 처리
  }
};

const lobby = async () => {
  console.clear();
  console.log(chalk.yellow.bold('=== 로비 화면 ==='));
  console.log('게임을 재시작하시겠습니까? 1 : 예 ,  2 : 아니오');

  const choice = readlineSync.question('선택: ');
  if (choice === '1') {
    await startGame();
  } else {
    console.log('게임을 종료합니다.');
    process.exit();
  }
};
export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  while (stage <= 20) {
    const monster = new Monster(stage);
    const result = await battle(stage, player, monster);
    if (stage === 10) {
      // let heal = Math.floor(Math.random() * 51) + 100; // 0 ~ 150 랜덤으로 회복증가
      let heal = Math.floor(Math.random() * 51) + 100; // 100 ~ 150 랜덤으로 회복 증가
      player.hp += heal; // 플레이어의 체력 회복
      readlineSync.question(
        chalk.blue.bold(
          `당신은 가는길에 온천을 발견해 쉬고가기로 결정했습니다... 총 ${heal + player.hp} 회복했습니다!`,
        ),
      );

      player.healstage();
    }

    if (result === 'gameOver') {
      readlineSync.question(chalk.red.bold('게임이 종료되었습니다.'));
      return lobby(); // 로비화면 이동
    }

    // 스테이지 클리어 및 게임 종료 조건
    // 클리어 되었을 시 축하 멘트 나오게 만들기
    if (stage === 20) {
      readlineSync.question(chalk.green.bold('축하드립니다! 모든 스테이지를 클리어하셨습니다!'));
      return lobby(); // 게임 재 시작 할건지 로비화면으로 이동
    }

    // 스테이지 1씩 올림
    stage++;
  }
}

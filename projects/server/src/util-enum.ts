/// Enums
export enum Difficulty {
    EASY = 'easy',
    NORMAL = 'normal',
    HARD = 'hard',
};

export enum BlockType {
    BOMB = 'bomb',
    NUMBER = 'number',
    BLANK = 'blank',
};

export enum BlockStatus {
    CLOSED = 'closed',
    OPEN = 'open',
    FLAG = 'flag',
}

export enum GameStatus {
    STARTING = 'starting',
    RUNNING = 'running',
    WON = 'won',
    LOST = 'lost',
};

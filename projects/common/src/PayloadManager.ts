export enum ActionType {
    NEW_GAME = 'new-game',
    OPEN_BLOCK = 'open-block',
    FLAG_BLOCK = 'flag-block',
    UPDATE_TICK = 'update-tick',
    BOARD_REFRESH = 'board-refresh',
    END_GAME = 'end-game',
};

export type ActionData = object | string | number;

export type ActionPayload = {
    id: number;
    type: ActionType;
    data: ActionData;
};

const checkIfDataIsValid = (pData: ActionData): boolean => {
    if (Number.isFinite(pData)) { return true; }
    if (typeof pData === 'string') { return true; }
    if ((typeof pData === 'object') && (pData !== null) && (!Array.isArray(pData))) { return true; }

    return false;
};

const checkIfTypeIsValid = (pType: ActionType): boolean => Object.values(ActionType).includes(pType);

export const encodeData = ({ id, type, data }: ActionPayload): string => {
    if (!checkIfTypeIsValid(type)) { throw new Error('Type is not valid'); }
    if (!checkIfDataIsValid(data)) { throw new Error('Data is not valid'); }

    return JSON.stringify({ id, type, data });
};

export const decodeData = (pString: string): ActionPayload => {
    const { id, type, data }: ActionPayload = JSON.parse(pString);
    if (!checkIfTypeIsValid(type)) { throw new Error('Type is not valid'); }
    if (!checkIfDataIsValid(data)) { throw new Error('Data is not valid'); }

    return { id, type, data };
};

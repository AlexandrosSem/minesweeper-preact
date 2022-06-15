import { useState, useEffect } from 'preact/hooks';

export const FlagNumber = ({ reset, flags, flagStatus }) => {
	const [ numberOfFlags, setNumberOfFlags ] = useState(0);

	useEffect(() => {
		setNumberOfFlags(flags);
	}, [ reset, flags ]);

	useEffect(() => {
		if (flagStatus === '') { return; }

		if (flagStatus === 'increase') { setNumberOfFlags(numberOfFlags + 1); }
		else { setNumberOfFlags(numberOfFlags - 1); }
	}, [ flagStatus ]);

	return <div>{numberOfFlags}</div>;
};

import { useState, useEffect } from 'preact/hooks';

export const FlagNumber = ({ reset, flags }) => {
	const [ numberOfFlags, setNumberOfFlags ] = useState(0);

	useEffect(() => {
		setNumberOfFlags(flags);
	}, [ reset, flags ]);

	return <div>{numberOfFlags}</div>;
};

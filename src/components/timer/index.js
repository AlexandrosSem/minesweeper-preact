import style from './style.css';
import { useState, useEffect } from 'preact/hooks';

export const Timer = ({ status }) => {
	const [ time, setTime ] = useState(0);
	const [ initTime, setInitTime ] = useState(0);
	const [ isRunning, setIsRunning ] = useState(false);
	const [ displayTime, setDisplayTime ] = useState('');

	useEffect(() => {
		const tNowRunning = (status === 'running');
		if (status === 'starting') {
			setTime(0);
			setInitTime(0);
		}
		setIsRunning(tNowRunning);
	}, [ status ]);

	useEffect(() => {
		if (!isRunning) { return; }

		const tTimerId = setInterval(() => {
			const tTime = Math.trunc((new Date().getTime() - initTime) / 1000);
			setTime(tTime);
		}, 250);

		return () => { clearInterval(tTimerId); };
	}, [ isRunning, initTime ]);

	useEffect(() => {
		if (!isRunning) { return; }

		if (initTime === 0) {
			setInitTime(new Date().getTime());
		}
	}, [ isRunning ]);

	useEffect(() => {
		setDisplayTime(time.toString().padStart(4, 0));
	}, [ time ]);

	return <span>{ displayTime }</span>;
};
import './Gift.css';

interface GiftProps {
    onClose: () => void;
}

export default function Gift({ onClose }: GiftProps) {
    return (
        <div className="gift-overlay">
            <div className="gift-container">
                <button className="gift-close-button" onClick={onClose}>
                    ✕
                </button>
                <div className="gift-content">
                    <div className="gift-image-container">
                        <img
                            src="/foto/cewek.jpg"
                            alt="Birthday Gift"
                            className="gift-image"
                        />
                    </div>
                    <div className="gift-message">
                        <h2>Happy Birthday My Love! ❤️</h2>
                        <p>
                            Semoga di hari istimewa ini, semua harapan dan mimpimu menjadi kenyataan.
                        </p>
                        <p className="gift-signature">
                            With all my love<br />
                            Your Special One
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
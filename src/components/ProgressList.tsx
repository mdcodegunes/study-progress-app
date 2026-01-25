import React, { useEffect, useState } from 'react';
import { Lesson } from '../types';

interface ProgressListProps {
    progressList: Lesson[];
    onDeleteLesson: (id: string) => void | Promise<void>;
    lessonTotalPages: Record<string, number>;
    showOnlyLineGraph?: boolean;
}

// Turkish date formatter
const formatDateTR = (dateStr: string | undefined) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return "-";
    const months = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];
    return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
};

const BASIC_LESSONS = [
    "Anatomi", "Patoloji", "Farmakoloji", "Mikrobiyoloji", "Biyokimya", "Fizyoloji – Histoloji – Embriyoloji"
];
const CLINIC_LESSONS = [
    "Dahiliye", "Pediatri", "Kadın Doğum ve Hastalıklar", "Genel Cerrahi", "Küçük Stajlar"
];

const ProgressList: React.FC<ProgressListProps> = ({
    progressList,
    onDeleteLesson,
    lessonTotalPages,
    showOnlyLineGraph = false
}) => {
    // Total studied per lesson (pages and questions)
    const lessonTotals = progressList.reduce<Record<string, { pages: number; questions: number; totalPages: number; repeatTimes: number }>>((acc, lesson) => {
        if (!acc[lesson.title]) {
            acc[lesson.title] = { pages: 0, questions: 0, totalPages: lesson.totalPages, repeatTimes: lesson.repeatTimes };
        }
        acc[lesson.title].pages += lesson.pageStudied;
        acc[lesson.title].questions += lesson.questionsSolved || 0;
        acc[lesson.title].totalPages = lesson.totalPages;
        acc[lesson.title].repeatTimes = lesson.repeatTimes;
        return acc;
    }, {});

    // Daily totals for pages, hours, and questions
    const dayTotals = progressList.reduce<Record<string, { pages: number; hours: number; questions: number }>>((acc, lesson) => {
        if (!acc[lesson.date]) {
            acc[lesson.date] = { pages: 0, hours: 0, questions: 0 };
        }
        acc[lesson.date].pages += lesson.pageStudied;
        acc[lesson.date].hours += lesson.hoursStudied || 0;
        acc[lesson.date].questions += lesson.questionsSolved || 0;
        return acc;
    }, {});

    // Helper for percentage
    const getPercent = (studied: number, total: number) =>
        total > 0 ? Math.min(100, Math.round((studied / total) * 100)) : 0;

    // Sort lessons from newest to oldest
    const sortedList = [...progressList].sort((a, b) => {
        if (a.date === b.date) return 0;
        return a.date < b.date ? 1 : -1;
    });

    const dailyKeys = Object.keys(dayTotals).sort((a, b) => a.localeCompare(b)); // oldest to newest
    const maxPages = Math.max(...Object.values(dayTotals).map(d => d.pages), 1);
    const maxQuestions = Math.max(...Object.values(dayTotals).map(d => d.questions), 1);
    const maxHours = Math.max(...Object.values(dayTotals).map(d => d.hours), 1);

    // --- DAILY LINEAR GRAPH COMPONENT ---
    const DailyLinearGraph = () => (
        <div style={{ margin: '0 0 32px 0', background: '#23272a', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
            <h3 style={{ marginTop: 0, color: '#e0e0e0', fontSize: 18 }}>Günlük Çalışma Grafiği</h3>
            <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 28, minHeight: 120 }}>
                    {dailyKeys.map(date => {
                        const d = dayTotals[date];
                        // Format hours as "X.YY" to "X saat YY dakika"
                        const hours = Math.floor(d.hours);
                        const minutes = Math.round((d.hours - hours) * 60);
                        const formattedSaat = (hours === 0 && minutes === 0)
                            ? "0 saat"
                            : `${hours > 0 ? `${hours} saat` : ""}${hours > 0 && minutes > 0 ? " " : ""}${minutes > 0 ? `${minutes} dakika` : ""}`;
                        return (
                            <div key={date} style={{ minWidth: 60, textAlign: 'center', color: '#f1f3f4', flex: '0 0 60px' }}>
                                {/* Linear bars */}
                                <div style={{ height: 80, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 6 }}>
                                    <div title={`Sayfa: ${d.pages}`} style={{
                                        height: 8,
                                        width: `${(d.pages / maxPages) * 100}%`,
                                        background: '#4caf50',
                                        borderRadius: 3,
                                        margin: '2px 0',
                                        opacity: 0.95,
                                        transition: 'width 0.3s'
                                    }} />
                                    <div title={`Soru: ${d.questions}`} style={{
                                        height: 8,
                                        width: `${(d.questions / maxQuestions) * 100}%`,
                                        background: '#2196f3',
                                        borderRadius: 3,
                                        margin: '2px 0',
                                        opacity: 0.95,
                                        transition: 'width 0.3s'
                                    }} />
                                    <div title={`Saat: ${formattedSaat}`} style={{
                                        height: 8,
                                        width: `${(d.hours / maxHours) * 100}%`,
                                        background: '#ffb300',
                                        borderRadius: 3,
                                        margin: '2px 0',
                                        opacity: 0.95,
                                        transition: 'width 0.3s'
                                    }} />
                                </div>
                                <div style={{ fontSize: 11, marginTop: 8, color: '#b0b0b0', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                                    <span style={{ color: '#4caf50', display: 'block' }}>S: {d.pages}</span>
                                    <span style={{ color: '#2196f3', display: 'block' }}>Q: {d.questions}</span>
                                    <span style={{ color: '#ffb300', display: 'block' }}>T: {formattedSaat}</span>
                                </div>
                                <div style={{ fontSize: 10, marginTop: 4, color: '#b0b0b0', whiteSpace: 'nowrap' }}>
                                    {formatDateTR(date).split(' ')[0]}<br />{formatDateTR(date).split(' ')[1]}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 13, marginTop: 4, color: '#b0b0b0' }}>
                <span>
                    <span style={{ display: 'inline-block', width: 12, height: 8, background: '#4caf50', borderRadius: 2, marginRight: 4 }} /> Sayfa
                </span>
                <span>
                    <span style={{ display: 'inline-block', width: 12, height: 8, background: '#2196f3', borderRadius: 2, marginRight: 4 }} /> Soru
                </span>
                <span>
                    <span style={{ display: 'inline-block', width: 12, height: 8, background: '#ffb300', borderRadius: 2, marginRight: 4 }} /> Saat
                </span>
            </div>
        </div>
    );

    // --- LINE GRAPH COMPONENT ---
    const LineGraph = () => {
        if (dailyKeys.length === 0) return null;

        // Prepare data arrays
        const pagesArr = dailyKeys.map(date => dayTotals[date].pages);
        const questionsArr = dailyKeys.map(date => dayTotals[date].questions);
        const hoursArr = dailyKeys.map(date => dayTotals[date].hours);

        // Normalize each metric to its own max
        const maxPagesY = Math.max(...pagesArr, 1);
        const maxQuestionsY = Math.max(...questionsArr, 1);
        const maxHoursY = Math.max(...hoursArr, 1);

        const width = Math.max(400, dailyKeys.length * 70);
        const height = 220;
        const padding = 44;
        const stepX = (width - 2 * padding) / Math.max(1, dailyKeys.length - 1);

        // Helper to get SVG points (normalized)
        const getPoints = (arr: any[], maxY: number) =>
            arr.map((v: number, i: number) => [
                padding + i * stepX,
                height - padding - ((v / maxY) * (height - 2 * padding))
            ]);

        const toPath = (points: any[]) =>
            points.reduce(
                (acc: string, [x, y]: any, i: number) => acc + (i === 0 ? `M${x},${y}` : ` L${x},${y}`),
                ''
            );

        const pagesPoints = getPoints(pagesArr, maxPagesY);
        const questionsPoints = getPoints(questionsArr, maxQuestionsY);
        const hoursPoints = getPoints(hoursArr, maxHoursY);

        return (
            <div style={{
                background: '#23272a',
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
                overflowX: 'auto',
                boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
                border: '1.5px solid #333',
                minWidth: 340,
                maxWidth: '100%',
            }}>
                <h3 style={{
                    margin: '0 0 12px 0',
                    color: '#e0e0e0',
                    fontSize: 20,
                    letterSpacing: 0.5,
                    textAlign: 'center'
                }}>
                    <DaysLeft />
                    Günlük Çalışma Çizgi Grafiği
                </h3>
                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <svg width={width} height={height} style={{ display: 'block', margin: '0 auto', background: '#23272a' }}>
                        {/* Y grid lines */}
                        {[0.25, 0.5, 0.75, 1].map(f => {
                            const y = padding + (1 - f) * (height - 2 * padding);
                            return (
                                <line
                                    key={f}
                                    x1={padding}
                                    x2={width - padding}
                                    y1={y}
                                    y2={y}
                                    stroke="#444"
                                    strokeDasharray="3,3"
                                />
                            );
                        })}
                        {/* Y axis labels for each metric */}
                        <text
                            x={padding - 38}
                            y={padding + 8}
                            fontSize="15"
                            fill="#4caf50"
                            textAnchor="start"
                            fontWeight="bold"
                            style={{ letterSpacing: 1 }}
                        >
                            Sayfa
                        </text>
                        <text
                            x={padding - 38}
                            y={padding + 32}
                            fontSize="15"
                            fill="#2196f3"
                            textAnchor="start"
                            fontWeight="bold"
                            style={{ letterSpacing: 1 }}
                        >
                            Soru
                        </text>
                        <text
                            x={padding - 38}
                            y={padding + 56}
                            fontSize="15"
                            fill="#ffb300"
                            textAnchor="start"
                            fontWeight="bold"
                            style={{ letterSpacing: 1 }}
                        >
                            Saat
                        </text>
                        {/* Pages line */}
                        <path d={toPath(pagesPoints)} fill="none" stroke="#4caf50" strokeWidth="3" />
                        {/* Questions line */}
                        <path d={toPath(questionsPoints)} fill="none" stroke="#2196f3" strokeWidth="3" />
                        {/* Hours line */}
                        <path d={toPath(hoursPoints)} fill="none" stroke="#ffb300" strokeWidth="3" />
                        {/* Points and value labels */}
                        {pagesPoints.map(([x, y]: any, i: number) => (
                            <g key={'p'+i}>
                                <circle cx={x} cy={y} r={5} fill="#4caf50" stroke="#23272a" strokeWidth="2" />
                                <text x={x} y={y-12} fontSize="12" fill="#4caf50" textAnchor="middle" fontWeight="bold">{pagesArr[i]}</text>
                            </g>
                        ))}
                        {questionsPoints.map(([x, y]: any, i: number) => (
                            <g key={'q'+i}>
                                <circle cx={x} cy={y} r={5} fill="#2196f3" stroke="#23272a" strokeWidth="2" />
                                <text x={x} y={y-12} fontSize="12" fill="#2196f3" textAnchor="middle" fontWeight="bold">{questionsArr[i]}</text>
                            </g>
                        ))}
                        {hoursPoints.map(([x, y]: any, i: number) => (
                            <g key={'h'+i}>
                                <circle cx={x} cy={y} r={5} fill="#ffb300" stroke="#23272a" strokeWidth="2" />
                                <text x={x} y={y+20} fontSize="12" fill="#ffb300" textAnchor="middle" fontWeight="bold">{hoursArr[i]}</text>
                            </g>
                        ))}
                        {/* X labels */}
                        {dailyKeys.map((date, i) => (
                            <text
                                key={date}
                                x={padding + i * stepX}
                                y={height - padding + 22}
                                textAnchor="middle"
                                fontSize="13"
                                fill="#b0b0b0"
                                fontWeight="bold"
                            >
                                {formatDateTR(date).split(' ')[0]}
                            </text>
                        ))}
                    </svg>
                </div>
                <div style={{
                    display: 'flex',
                    gap: 18,
                    fontSize: 15,
                    marginTop: 10,
                    color: '#b0b0b0',
                    justifyContent: 'center'
                }}>
                    <span>
                        <span style={{ display: 'inline-block', width: 18, height: 6, background: '#4caf50', borderRadius: 2, marginRight: 6 }} /> Sayfa
                    </span>
                    <span>
                        <span style={{ display: 'inline-block', width: 18, height: 6, background: '#2196f3', borderRadius: 2, marginRight: 6 }} /> Soru
                    </span>
                    <span>
                        <span style={{ display: 'inline-block', width: 18, height: 6, background: '#ffb300', borderRadius: 2, marginRight: 6 }} /> Saat
                    </span>
                </div>
            </div>
        );
    };

    if (showOnlyLineGraph) {
        return <LineGraph />;
    }

    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    return (
        <div>
            <h2>Çalışma Grafiği</h2>
            <div>
                <h3>Toplam Çalışılan (Ders Bazında)</h3>
                <div className="card-row">
                    {BASIC_LESSONS.map(title => {
                        const data = lessonTotals[title];
                        const totalPages = data ? data.totalPages : lessonTotalPages[title] || '-';
                        const pages = data ? data.pages : 0;
                        return (
                            <div key={title} className="card-style">
                                <strong style={{ color: "#4caf50" }}>{title}</strong><br />
                                <strong>Çalışılan Sayfa:</strong> {pages} / {totalPages} <br />
                                <strong>Çözülen Soru:</strong> {data ? data.questions : '-'} <br />
                                <strong>Çalışılan Saat:</strong> {
                                    (() => {
                                        const totalHours = progressList
                                            .filter(l => l.title === title)
                                            .reduce((sum, l) => sum + (l.hoursStudied || 0), 0);
                                        const hours = Math.floor(totalHours);
                                        const minutes = Math.round((totalHours - hours) * 60);
                                        if (hours === 0 && minutes === 0) return "0 saat";
                                        if (hours > 0 && minutes > 0) return `${hours} saat ${minutes} dakika`;
                                        if (hours > 0) return `${hours} saat`;
                                        return `${minutes} dakika`;
                                    })()
                                } <br />
                                <strong>Gün:</strong> {
                                    (() => {
                                        const days = new Set(progressList.filter(l => l.title === title).map(l => l.date));
                                        return days.size;
                                    })()
                                } <br />
                                <strong>Toplam Sayfa:</strong> {totalPages} <br />
                                <strong>Kalan Sayfa:</strong> {totalPages !== '-' ? Math.max(0, totalPages - pages) : '-'} <br />
                                <strong>Kaçıncı Tekrar:</strong> {data ? data.repeatTimes : '-'} <br />
                                <strong>İlerleme:</strong> {totalPages !== '-' && totalPages > 0 ? getPercent(pages, totalPages) : 0}%
                                <div className="progress-bar-bg">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: totalPages !== '-' && totalPages > 0 ? `${getPercent(pages, totalPages)}%` : '0%' }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="card-row">
                    {CLINIC_LESSONS.map(title => {
                        const data = lessonTotals[title];
                        const totalPages = data ? data.totalPages : lessonTotalPages[title] || '-';
                        const pages = data ? data.pages : 0;
                        return (
                            <div key={title} className="card-style">
                                <strong style={{ color: BASIC_LESSONS.includes(title) ? "#2196f3" : "#ff9800" }}>{title}</strong><br />
                                <strong>Çalışılan Sayfa:</strong> {pages} / {totalPages} <br />
                                <strong>Çözülen Soru:</strong> {data ? data.questions : '-'} <br />
                                <strong>Çalışılan Saat:</strong> {
                                    (() => {
                                        // Sum all hours for this lesson
                                        const totalHours = progressList
                                            .filter(l => l.title === title)
                                            .reduce((sum, l) => sum + (l.hoursStudied || 0), 0);
                                        const hours = Math.floor(totalHours);
                                        const minutes = Math.round((totalHours - hours) * 60);
                                        if (hours === 0 && minutes === 0) return "0 saat";
                                        if (hours > 0 && minutes > 0) return `${hours} saat ${minutes} dakika`;
                                        if (hours > 0) return `${hours} saat`;
                                        return `${minutes} dakika`;
                                    })()
                                } <br />
                                <strong>Gün:</strong> {
                                    // Count unique days this lesson was studied
                                    (() => {
                                        const days = new Set(progressList.filter(l => l.title === title).map(l => l.date));
                                        return days.size;
                                    })()
                                } <br />
                                <strong>Toplam Sayfa:</strong> {totalPages} <br />
                                <strong>Kalan Sayfa:</strong> {totalPages !== '-' ? Math.max(0, totalPages - pages) : '-'} <br />
                                <strong>Kaçıncı Tekrar:</strong> {data ? data.repeatTimes : '-'} <br />
                                <strong>İlerleme:</strong> {totalPages !== '-' && totalPages > 0 ? getPercent(pages, totalPages) : 0}%
                                <div className="progress-bar-bg">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: totalPages !== '-' && totalPages > 0 ? `${getPercent(pages, totalPages)}%` : '0%' }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div>
                <h3>Günlük Toplamlar</h3>
                <div style={{ maxHeight: 220, overflowY: 'auto', background: '#23272a', borderRadius: 8, padding: 8, border: '1px solid #333' }}>
                    <ul style={{ margin: 0 }}>
                        {Object.entries(dayTotals)
                            .sort(([dateA], [dateB]) => dateA < dateB ? 1 : -1)
                            .map(([date, data]) => {
                                // Format hours as "X saat Y dakika"
                                const hours = Math.floor(data.hours);
                                const minutes = Math.round((data.hours - hours) * 60);
                                const formattedTime =
                                    hours > 0 || minutes > 0
                                        ? `${hours > 0 ? `${hours} saat` : ''}${hours > 0 && minutes > 0 ? ' ' : ''}${minutes > 0 ? `${minutes} dakika` : ''}`
                                        : '0 saat';
                                return (
                                    <li key={date}>
                                        <strong>{formatDateTR(date)}:</strong> {data.pages} sayfa, {data.questions} soru, {formattedTime}<br />
                                        <span>
                                            Saatte Ortalama Sayfa/Soru: {data.hours > 0 ? (data.pages / data.hours).toFixed(2) : '-'} / {data.hours > 0 ? (data.questions / data.hours).toFixed(2) : '-'}
                                        </span>
                                    </li>
                                );
                            })}
                    </ul>
                </div>
            </div>
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 18,
                marginTop: 24,
                marginBottom: 24,
                justifyContent: "flex-start"
            }}>
                {sortedList.map((lesson, index) => (
                    <div
                        key={index}
                        style={{
                            background: "#23272a",
                            border: "1px solid #444",
                            borderRadius: 10,
                            padding: "16px 20px",
                            color: "#fff",
                            minWidth: 240,
                            maxWidth: 270,
                            margin: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            position: "relative"
                        }}
                    >
                        <div>
                            <strong>Ders:</strong> {lesson.title} <br />
                            <strong>Tarih:</strong> {formatDateTR(lesson.date)} <br />
                            <strong>Çalışılan Sayfa:</strong> {lesson.pageStudied} / {lesson.totalPages} <br />
                            <strong>Çözülen Soru:</strong> {lesson.questionsSolved} <br />
                            <strong>Kaçıncı Tekrar:</strong> {lesson.repeatTimes} <br />
                            <strong>Çalışılan saat:</strong> {
                                (() => {
                                    const hours = Math.floor(lesson.hoursStudied);
                                    const minutes = Math.round((lesson.hoursStudied - hours) * 60);
                                    if (hours === 0 && minutes === 0) return "0 saat";
                                    if (hours > 0 && minutes > 0) return `${hours} saat ${minutes} dakika`;
                                    if (hours > 0) return `${hours} saat`;
                                    return `${minutes} dakika`;
                                })()
                            }
                        </div>
                        <button
                            style={{
                                background: "#d32f2f",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                padding: "8px 18px",
                                fontWeight: 600,
                                cursor: "pointer",
                                marginTop: 12,
                                alignSelf: "flex-end"
                            }}
                            onClick={() => setDeleteIndex(index)}
                        >
                            Sil
                        </button>
                        {deleteIndex === index && (
                            <div style={{
                                background: "#23272a",
                                border: "1px solid #444",
                                borderRadius: 8,
                                padding: 12,
                                color: "#fff",
                                minWidth: 180,
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                zIndex: 10,
                                boxShadow: "0 2px 12px rgba(0,0,0,0.25)"
                            }}>
                                Silmek istediğinize emin misiniz?
                                <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
                                    <button
                                        style={{ background: "#d32f2f", color: "#fff", border: "none", borderRadius: 6, padding: "6px 16px", fontWeight: 600 }}
                                        onClick={() => { if (lesson.id) { onDeleteLesson(lesson.id); } setDeleteIndex(null); }}
                                    >
                                        Evet
                                    </button>
                                    <button
                                        style={{ background: "#444", color: "#fff", border: "none", borderRadius: 6, padding: "6px 16px", fontWeight: 600 }}
                                        onClick={() => setDeleteIndex(null)}
                                    >
                                        Hayır
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const TARGET_DATE = new Date("2025-03-15T00:00:00");

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const DaysLeft = () => {
    const getDayMetrics = () => {
        const today = startOfDay(new Date());
        const target = startOfDay(TARGET_DATE);

        // Positive => days remaining until TARGET_DATE, negative => days since TARGET_DATE
        const diffDays = Math.ceil((target.getTime() - today.getTime()) / MS_PER_DAY);

        // Next March 15 occurrence (use local time, start of day)
        const month = TARGET_DATE.getMonth();
        const day = TARGET_DATE.getDate();
        let next = new Date(today.getFullYear(), month, day);
        if (next.getTime() < today.getTime()) {
            next = new Date(today.getFullYear() + 1, month, day);
        }
        const nextDiffDays = Math.ceil((next.getTime() - today.getTime()) / MS_PER_DAY);

        return { diffDays, nextDiffDays };
    };

    const [{ diffDays, nextDiffDays }, setMetrics] = useState(getDayMetrics());

    useEffect(() => {
        const timer = setInterval(() => {
            setMetrics(getDayMetrics());
        }, 60 * 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{
            background: '#23272a',
            color: '#ffb300',
            borderRadius: 10,
            padding: '12px 18px',
            fontSize: 26,
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 18,
            letterSpacing: 1.2,
            border: '1.5px solid #444',
            maxWidth: 420,
            marginLeft: 'auto',
            marginRight: 'auto'
        }}>
            {diffDays >= 0
                ? `Sınava Kalan Gün: ${diffDays}`
                : `Sınav Geçeli Gün: ${Math.abs(diffDays)}`}
            <div style={{ marginTop: 6, fontSize: 14, fontWeight: 600, color: '#f1f3f4' }}>
                Bir Sonraki Sınava Kalan Gün: {nextDiffDays}
            </div>
        </div>
    );
};

export default ProgressList;
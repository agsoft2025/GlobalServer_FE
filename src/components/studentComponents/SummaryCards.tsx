import { Card, CardContent, Typography, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';

type SummaryCardsProps = {
  summary: {
    totalLocations: number;
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
  };
};

const StyledCard = styled(Card)<{ bgcolor: string }>(({ bgcolor }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  backgroundColor: bgcolor,
  '&:hover': {
    transform: 'scale(1.03)',
  },
}));

export default function SummaryCards({ summary }: SummaryCardsProps) {
  if (!summary) return <Skeleton variant="rectangular" height={118} />;

  const cards = [
    { title: 'Total Locations', value: summary.totalLocations, bgColor: '#3E6AB3', color: '#fff' },
    { title: 'Total Students', value: summary.totalStudents, bgColor: '#EF5675', color: '#fff' },
    { title: 'Active Students', value: summary.activeStudents, bgColor: '#FF9800', color: '#fff' },
    { title: 'Inactive Students', value: summary.inactiveStudents, bgColor: '#9C27B0', color: '#fff' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card, index) => (
        <StyledCard key={index} bgcolor={card.bgColor}>
          <CardContent>
            <Typography color="textSecondary" sx={{color: "#fff"}} gutterBottom>
              {card.title}
            </Typography>
            <Typography variant="h4" component="h2" style={{ color: card.color }}>
              {card.value}
            </Typography>
          </CardContent>
        </StyledCard>
      ))}
    </div>
  );
}

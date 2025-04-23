// tabs/MenuTab.jsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const MenuTab = () => {
  return (
    <Card className='shadow-sm'>
      <CardHeader>
        <CardTitle>Menu Management</CardTitle>
        <CardDescription>
          Update your restaurant&apos;s menu items
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Menu management interface would go here</p>
      </CardContent>
    </Card>
  );
};

export default MenuTab;

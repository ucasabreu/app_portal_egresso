import Network from "../../assets/network.jpg";
import PageBanner from "./PageBanner";

export default function EditorialHeader({ breadcrumb, eyebrow, title, description, actions, image = Network }) {
  return <PageBanner breadcrumb={breadcrumb} eyebrow={eyebrow} title={title} description={description} actions={actions} image={image} />;
}

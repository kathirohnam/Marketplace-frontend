import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatExpansionModule } from "@angular/material/expansion";

@Component({
    selector: "app-faq",
    imports: [CommonModule, MatIconModule, MatExpansionModule],
    templateUrl: "./faq.component.html",
    styleUrls: ["./faq.component.scss"]
})
export class FaqComponent {
  faqs = [
    {
      category: "General",
      questions: [
        {
          question: "What is an LLC and why should I form one?",
          answer:
            "An LLC (Limited Liability Company) is a business structure that combines the limited liability protection of a corporation with the tax flexibility of a partnership. It protects your personal assets from business debts and liabilities, provides tax advantages, and offers operational flexibility. LLCs are ideal for small businesses, freelancers, and entrepreneurs looking for asset protection without the complexity of a corporation.",
        },
        {
          question: "How long does it take to form an LLC?",
          answer:
            "The formation time varies by state, but typically takes 1-15 business days. With our expedited service, many states can process your LLC in 24-48 hours. We provide real-time updates throughout the process and will notify you immediately once your LLC is approved.",
        },
        {
          question: "What's included in your LLC formation service?",
          answer:
            "Our service includes LLC name search and reservation, preparation and filing of Articles of Organization, registered agent service (1st year free), custom operating agreement template, EIN application assistance, and ongoing compliance support. We handle all the paperwork and legal requirements so you can focus on your business.",
        },
      ],
    },
    // {
    //   category: 'Pricing & Fees',
    //   questions: [
    //     {
    //       question: 'Are there any hidden fees?',
    //       answer: 'No hidden fees ever. Our pricing is completely transparent. You\'ll pay our service fee plus the mandatory state filing fee, which varies by state ($40-$500). We\'ll show you the exact total cost for your state before you complete your order. There are no surprise charges or additional fees.'
    //     },
    //     {
    //       question: 'What are state filing fees and why do I have to pay them?',
    //       answer: 'State filing fees are mandatory charges imposed by your state government to process your LLC formation. These fees go directly to the state, not to ClearIncorp. Fees vary by state, ranging from $40 (Kentucky) to $500 (Massachusetts). Every LLC formation service must collect these fees as they\'re required by law.'
    //     },
    //     {
    //       question: 'Do you offer a money-back guarantee?',
    //       answer: 'Yes! We offer a 100% satisfaction guarantee. If we can\'t successfully form your LLC, we\'ll refund your service fee completely. We have a 99.9% success rate, so you can proceed with confidence knowing your LLC formation is in expert hands.'
    //     }
    //   ]
    // },
    // {
    //   category: 'Process & Requirements',
    //   questions: [
    //     {
    //       question: 'What information do I need to provide?',
    //       answer: 'You\'ll need your desired LLC name, business address, registered agent information (we can serve as your registered agent), member/owner information, and your business purpose. The entire online form takes about 5-10 minutes to complete. We\'ll guide you through each step and provide help when needed.'
    //     },
    //     {
    //       question: 'Can I form an LLC if I don\'t live in the state?',
    //       answer: 'Absolutely! You can form an LLC in any state regardless of where you live. Many entrepreneurs choose to form in business-friendly states like Delaware, Wyoming, or Nevada for their favorable laws and tax benefits. We can help you determine the best state for your specific situation.'
    //     },
    //     {
    //       question: 'Do I need a registered agent?',
    //       answer: 'Yes, every LLC must have a registered agent in the state where it\'s formed. The registered agent receives legal documents and official correspondence on behalf of your LLC. We provide registered agent service for free during your first year, then it\'s just $99/year to continue.'
    //     }
    //   ]
    // },
    // {
    //   category: 'After Formation',
    //   questions: [
    //     {
    //       question: 'What happens after my LLC is formed?',
    //       answer: 'Once approved, you\'ll receive your Certificate of Formation, Operating Agreement, and EIN confirmation. We\'ll also provide guidance on opening a business bank account, obtaining necessary licenses, and maintaining compliance. Our customer dashboard gives you access to all your documents and ongoing support.'
    //     },
    //     {
    //       question: 'Do I need to file annual reports?',
    //       answer: 'Most states require LLCs to file annual or biennial reports to maintain good standing. These reports typically include basic information about your LLC and require a filing fee. We offer compliance monitoring services to remind you of deadlines and can handle the filings for you.'
    //     },
    //     {
    //       question: 'Can I change my LLC information after formation?',
    //       answer: 'Yes, you can typically change your LLC\'s name, address, members, or other information by filing amendments with the state. The process and fees vary by state. We can help you with amendments and ensure all changes are properly filed and documented.'
    //     }
    //   ]
    // }
  ];

  expandedQuestion: string | null = null;

  toggleQuestion(questionKey: string) {
    this.expandedQuestion =
      this.expandedQuestion === questionKey ? null : questionKey;
  }

  isExpanded(questionKey: string): boolean {
    return this.expandedQuestion === questionKey;
  }
}

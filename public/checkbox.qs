def UIComponent Checkbox1
   public Boolean checked: {{value}}
   div:
       input i1:
           type: checkbox
           checked: {{checked?'checked':void 0}}

def UIComponent TextBox
   public String text: {{value}}
   input i1:
     type: text
     value: {{text}}


def UIComponent main
   String valueProxy: {{value}}
   String href: "http://google.com"
   TextBox:
       text: {{value}}
   Checkbox1 c1:
       checked: {{value}}
   HBox hbox:
       a:
           value: {{value}}
           href: {{href}}
       a:
           value: {{value}}
           href: {{href}}
   div d1:
       Checkbox1 c2:
           checked: {{value}}
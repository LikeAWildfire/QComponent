//Universal indicator
def UIComponent Indicator
    public Number min: 0
    public Number max: 10
    public String description

    Number displayValue: {{value<min?min:value>max?max:value}}

    background: #ccc
    border: 5px solid black
    height: 140px
    width: 200px

    div
        position: absolute
        top: 0
        width: 100%
        height: 80%

        div
            position: absolute
            bottom: 0
            background: red
            height: 10px
            width: 50%
            transform-origin: right center
            rotation: {{180/(max/displayValue)}}
            transition: 'all 0.2s ease'
        div: {{min}}
            position: absolute
            left: 0
            bottom: 0
        div: {{max}}
            position: absolute
            right: 0
            bottom: 0
    div: {{description}}
        position: absolute
        bottom: 0
//indicator


def LogicalComponent Reactor
    Timer timer:
        enabled: true
        interval: 100
        .tick: ()=>{
            var cTemp=temperature;
            //var cRodPos=this.get('controlRodsPosition');
            cTemp+=Math.round(200*(controlRodsPosition-4.5))/100;
            temperature = cTemp

            if(meltdown){
                timer.stop();
            }
        }

    public Number temperature: 600
    public Number power: 5000
    public Number controlRodsPosition: 7

    public Boolean danger: {{temperature>1300}}
    public Boolean meltdown: {{temperature>2000}}
//Reactor

def Page main
    title: {{ r1.danger?  'Reactor is fine. Just need to be 20% more cooler' : 'Reactor is fine' }}

    Reactor r1

    HBox
        flexDefinition: 1* 1* 2*

        Indicator i1: {{r1.temperature}}

            min: 1
            max: 2000
            description: Temperature
        div
            span: Control rods position: {{r1.controlRodsPosition}}
                width: 200px
                padding: 12px
            br
            span: Temperature {{r1.temperature}}
                width: 200px
                padding: 12px

            span: {{r1.meltdown? 'Meltdown :(' : r1.danger ? 'Danger!' :'' }}
                color: white
                width: 200px
                padding: 12px
                background: red
                visibility: {{r1.meltdown||r1.danger?'visible':'hidden'}}
        div
            div: Reactor control
            input: ↑ Rods up
                width: 110px
                type: button
                .click: ()->{
                    var cPos=r1.get('controlRodsPosition');
                    if(cPos<9)
                        cPos+=1;
                    r1.set('controlRodsPosition',cPos);
                }
            br
            input: ↓ Rods down
                width: 110px
                type: button
                .click: ()->{
                    var cPos=r1.get('controlRodsPosition');
                    if(cPos>0)
                        cPos-=1;
                    r1.set('controlRodsPosition',cPos);
                }